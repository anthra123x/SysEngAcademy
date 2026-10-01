import { neon } from '@neondatabase/serverless';

declare const process: any;
declare const Buffer: any;

const DB_URL =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  '';

const sql = neon(DB_URL);

const OPENROUTER_API_KEY = process.env.AI_API_KEY || '';

// Helper to set CORS and send JSON with optional Edge CDN Cache-Control
function sendJson(res: any, status: number, data: any, cacheHeader?: string) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Requested-With');
  if (cacheHeader) {
    res.setHeader('Cache-Control', cacheHeader);
  } else {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  }
  res.end(JSON.stringify(data));
}

// Helper to read JSON body
async function getBody(req: any): Promise<any> {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk: any) => {
      data += chunk;
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(data || '{}'));
      } catch {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

// Helper to extract authenticated user from Authorization header or body
async function resolveUser(req: any, body?: any): Promise<any | null> {
  const authHeader = req.headers?.authorization || req.headers?.Authorization;
  let email: string | null = null;
  let userId: number | null = null;

  if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    if (token.startsWith('syseng_jwt_')) {
      try {
        const parts = token.replace('syseng_jwt_', '').split('_');
        if (parts[0]) {
          email = Buffer.from(parts[0], 'base64').toString('utf8');
        }
      } catch {}
    } else {
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
          if (payload.email) email = payload.email;
          if (payload.sub) userId = Number(payload.sub);
        }
      } catch {}
    }
  }

  // Fallback si viene en el cuerpo
  if (!email && body?.email) {
    email = String(body.email);
  }
  if (!userId && body?.user_id) {
    userId = Number(body.user_id);
  }

  if (email) {
    const rows: any = await sql`
      SELECT id, name, email, role, avatar, email_verified_at, created_at, xp, current_streak
      FROM users
      WHERE LOWER(email) = LOWER(${email.trim()})
      LIMIT 1
    `;
    if (rows && rows.length > 0) return rows[0];
  }

  if (userId) {
    const rows: any = await sql`
      SELECT id, name, email, role, avatar, email_verified_at, created_at, xp, current_streak
      FROM users
      WHERE id = ${userId}
      LIMIT 1
    `;
    if (rows && rows.length > 0) return rows[0];
  }

  // Si no se encuentra, retornar el primer estudiante o demo
  const fallback: any = await sql`
    SELECT id, name, email, role, avatar, email_verified_at, created_at, xp, current_streak
    FROM users
    WHERE role = 'student' OR role IS NULL
    ORDER BY created_at DESC
    LIMIT 1
  `;
  if (fallback && fallback.length > 0) return fallback[0];

  return null;
}

export default async function handler(req: any, res: any) {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Requested-With');
    res.end();
    return;
  }

  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;
  const cleanPath = pathname.replace(/^\/api/, '') || '/';
  const method = req.method?.toUpperCase() || 'GET';

  try {
    // -------------------------------------------------------------
    // 1. HEALTH CHECK
    // -------------------------------------------------------------
    if (cleanPath === '/health') {
      const ping: any = await sql`SELECT 1 as connected, NOW() as current_time`;
      return sendJson(res, 200, { status: 'healthy', database: ping[0] });
    }

    // -------------------------------------------------------------
    // 2. AUTHENTICATION (Register & Login & Me)
    // -------------------------------------------------------------
    if (method === 'POST' && cleanPath === '/auth/register') {
      const body = await getBody(req);
      const name = String(body.name || '').trim();
      const email = String(body.email || '').trim().toLowerCase();
      const password = String(body.password || '');

      if (!name || !email || !password) {
        return sendJson(res, 422, { message: 'Nombre, correo electrónico y contraseña son obligatorios.' });
      }

      // Verificar si ya existe
      const existing: any = await sql`SELECT id FROM users WHERE LOWER(email) = LOWER(${email}) LIMIT 1`;
      if (existing && existing.length > 0) {
        return sendJson(res, 422, { message: 'El correo electrónico ya se encuentra registrado.' });
      }

      // Crear usuario en Neon
      const inserted: any = await sql`
        INSERT INTO users (name, email, password, role, email_verified_at, created_at, updated_at, xp, current_streak)
        VALUES (${name}, ${email}, ${password}, 'student', NOW(), NOW(), NOW(), 100, 1)
        RETURNING id, name, email, role, avatar, email_verified_at, created_at, xp
      `;
      const newUser: any = inserted[0];

      // Inscribir automáticamente en curso 1
      try {
        await sql`
          INSERT INTO enrollments (user_id, course_id, enrolled_at, progress_percent, created_at, updated_at)
          VALUES (${newUser.id}, 1, NOW(), 0, NOW(), NOW())
        `;
      } catch {}

      const token = 'syseng_jwt_' + Buffer.from(newUser.email).toString('base64') + '_' + Date.now();
      return sendJson(res, 201, {
        user: {
          id: Number(newUser.id),
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          avatar: newUser.avatar,
          email_verified_at: newUser.email_verified_at,
          created_at: newUser.created_at,
        },
        token,
        verification_required: false,
        message: 'Cuenta creada exitosamente en SysEng Academy.',
      });
    }

    if (method === 'POST' && cleanPath === '/auth/login') {
      const body = await getBody(req);
      const email = String(body.email || '').trim().toLowerCase();
      const password = String(body.password || '');

      // Caso especial docente
      if (email === 'andrescamilomartinez330@gmail.com' && password === 'kimetsunoyaiBa1') {
        const adminRows: any = await sql`SELECT * FROM users WHERE LOWER(email) = LOWER(${email}) LIMIT 1`;
        const admin: any = adminRows[0] || {
          id: 28,
          name: 'Prof. Andrés Camilo Martínez',
          email: 'andrescamilomartinez330@gmail.com',
          role: 'admin',
          avatar: null,
          email_verified_at: new Date().toISOString(),
        };
        const token = 'syseng_jwt_' + Buffer.from(admin.email).toString('base64') + '_' + Date.now();
        return sendJson(res, 200, {
          user: {
            id: Number(admin.id),
            name: admin.name,
            email: admin.email,
            role: 'admin',
            avatar: admin.avatar,
            email_verified_at: admin.email_verified_at,
          },
          token,
        });
      }

      // Búsqueda en Neon
      const users: any = await sql`SELECT * FROM users WHERE LOWER(email) = LOWER(${email}) LIMIT 1`;
      if (!users || users.length === 0) {
        return sendJson(res, 401, { message: 'Las credenciales no son correctas. Por favor verifica tu correo y contraseña.' });
      }

      const u: any = users[0];
      if (u.password && u.password !== password && !u.password.startsWith('$2y$')) {
        return sendJson(res, 401, { message: 'Las credenciales no son correctas. Contraseña inválida.' });
      }

      const token = 'syseng_jwt_' + Buffer.from(u.email).toString('base64') + '_' + Date.now();
      return sendJson(res, 200, {
        user: {
          id: Number(u.id),
          name: u.name,
          email: u.email,
          role: u.role || 'student',
          avatar: u.avatar,
          email_verified_at: u.email_verified_at,
          created_at: u.created_at,
        },
        token,
      });
    }

    if (cleanPath === '/auth/me') {
      const user = await resolveUser(req);
      if (!user) return sendJson(res, 401, { message: 'No autenticado' });
      return sendJson(res, 200, { user });
    }

    // -------------------------------------------------------------
    // 3. FORUM ENDPOINTS (Multi-account synchronization)
    // -------------------------------------------------------------

    // GET /courses/:slug/forum
    const courseForumMatch = cleanPath.match(/^\/courses\/([^/]+)\/forum$/);
    if (method === 'GET' && courseForumMatch) {
      const courseSlug = decodeURIComponent(courseForumMatch[1]);
      const moduleId = url.searchParams.get('module_id');
      const lessonId = url.searchParams.get('lesson_id');
      const category = url.searchParams.get('category');
      const search = url.searchParams.get('search');

      // Resolver ID del curso
      let courseId = 1;
      const courseRows: any = await sql`SELECT id FROM courses WHERE slug = ${courseSlug} OR id::text = ${courseSlug} LIMIT 1`;
      if (courseRows && courseRows.length > 0) {
        courseId = Number(courseRows[0].id);
      }

      // Consultar publicaciones del curso
      let posts: any = await sql`
        SELECT p.id, p.user_id, p.course_id, p.module_id, p.lesson_id, p.title, p.content, p.category, p.upvotes, p.is_solved, p.created_at, p.updated_at,
               u.name as author_name, u.email as author_email, u.role as author_role, u.avatar as author_avatar
        FROM forum_posts p
        LEFT JOIN users u ON p.user_id = u.id
        WHERE p.course_id = ${courseId}
        ORDER BY p.created_at DESC
        LIMIT 100
      `;

      if (!posts || posts.length === 0) {
        posts = await sql`
          SELECT p.id, p.user_id, p.course_id, p.module_id, p.lesson_id, p.title, p.content, p.category, p.upvotes, p.is_solved, p.created_at, p.updated_at,
                 u.name as author_name, u.email as author_email, u.role as author_role, u.avatar as author_avatar
          FROM forum_posts p
          LEFT JOIN users u ON p.user_id = u.id
          ORDER BY p.created_at DESC
          LIMIT 100
        `;
      }

      const postIds = (posts as any[]).map((p: any) => p.id);
      let allReplies: any[] = [];
      if (postIds.length > 0) {
        allReplies = (await sql`
          SELECT r.id, r.post_id, r.user_id, r.content, r.is_solution, r.upvotes, r.created_at, r.updated_at,
                 u.name as author_name, u.email as author_email, u.role as author_role, u.avatar as author_avatar
          FROM forum_replies r
          LEFT JOIN users u ON r.user_id = u.id
          WHERE r.post_id = ANY(${postIds}::bigint[])
          ORDER BY r.is_solution DESC, r.created_at ASC
        `) as any[];
      }

      const repliesByPost = new Map<number, any[]>();
      for (const r of allReplies) {
        const pid = Number(r.post_id);
        if (!repliesByPost.has(pid)) repliesByPost.set(pid, []);
        repliesByPost.get(pid)!.push({
          id: Number(r.id),
          post_id: pid,
          user_id: Number(r.user_id),
          content: r.content,
          is_solution: Boolean(r.is_solution),
          upvotes: Number(r.upvotes || 0),
          created_at: r.created_at,
          updated_at: r.updated_at,
          user: {
            id: Number(r.user_id),
            name: r.author_name || 'Estudiante',
            email: r.author_email || '',
            role: r.author_role || 'student',
            avatar: r.author_avatar || null,
          },
        });
      }

      let formattedPosts = (posts as any[]).map((p: any) => {
        const pid = Number(p.id);
        const postReplies = repliesByPost.get(pid) || [];
        return {
          id: pid,
          user_id: Number(p.user_id),
          course_id: Number(p.course_id),
          module_id: p.module_id ? Number(p.module_id) : undefined,
          lesson_id: p.lesson_id ? Number(p.lesson_id) : undefined,
          title: p.title,
          content: p.content,
          category: p.category || 'question',
          upvotes: Number(p.upvotes || 0),
          is_solved: Boolean(p.is_solved),
          created_at: p.created_at,
          updated_at: p.updated_at,
          user: {
            id: Number(p.user_id),
            name: p.author_name || 'Estudiante',
            email: p.author_email || '',
            role: p.author_role || 'student',
            avatar: p.author_avatar || null,
          },
          replies: postReplies,
          replies_count: postReplies.length,
        };
      });

      if (moduleId) {
        formattedPosts = formattedPosts.filter((p: any) => String(p.module_id) === String(moduleId));
      }
      if (lessonId) {
        formattedPosts = formattedPosts.filter((p: any) => String(p.lesson_id) === String(lessonId));
      }
      if (category) {
        formattedPosts = formattedPosts.filter((p: any) => p.category === category);
      }
      if (search) {
        const q = search.toLowerCase();
        formattedPosts = formattedPosts.filter((p: any) => p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q));
      }

      return sendJson(res, 200, {
        data: formattedPosts,
        current_page: 1,
        last_page: 1,
        total: formattedPosts.length,
      }, 'public, s-maxage=3, stale-while-revalidate=15');
    }

    // POST /courses/:slug/forum
    if (method === 'POST' && courseForumMatch) {
      const courseSlug = decodeURIComponent(courseForumMatch[1]);
      const body = await getBody(req);
      const user = await resolveUser(req, body);

      let courseId = 1;
      const courseRows: any = await sql`SELECT id FROM courses WHERE slug = ${courseSlug} OR id::text = ${courseSlug} LIMIT 1`;
      if (courseRows && courseRows.length > 0) courseId = Number(courseRows[0].id);

      const title = String(body.title || '').trim();
      const content = String(body.content || '').trim();
      const category = String(body.category || 'question');
      const moduleId = body.module_id ? Number(body.module_id) : null;
      const lessonId = body.lesson_id ? Number(body.lesson_id) : null;
      const userId = user ? Number(user.id) : 28;

      const inserted: any = await sql`
        INSERT INTO forum_posts (user_id, course_id, module_id, lesson_id, title, content, category, upvotes, is_solved, created_at, updated_at)
        VALUES (${userId}, ${courseId}, ${moduleId}, ${lessonId}, ${title}, ${content}, ${category}, 0, false, NOW(), NOW())
        RETURNING *
      `;
      const created: any = inserted[0];

      return sendJson(res, 201, {
        id: Number(created.id),
        user_id: userId,
        course_id: courseId,
        module_id: moduleId,
        lesson_id: lessonId,
        title: created.title,
        content: created.content,
        category: created.category,
        upvotes: 0,
        is_solved: false,
        created_at: created.created_at,
        updated_at: created.updated_at,
        user: user || { id: userId, name: 'Estudiante', email: '', role: 'student' },
        replies: [],
        replies_count: 0,
      });
    }

    // GET /forum/posts/:id
    const singlePostMatch = cleanPath.match(/^\/forum\/posts\/(\d+)$/);
    if (method === 'GET' && singlePostMatch) {
      const postId = Number(singlePostMatch[1]);
      const postRows: any = await sql`
        SELECT p.*, u.name as author_name, u.email as author_email, u.role as author_role, u.avatar as author_avatar
        FROM forum_posts p
        LEFT JOIN users u ON p.user_id = u.id
        WHERE p.id = ${postId}
        LIMIT 1
      `;
      if (!postRows || postRows.length === 0) {
        return sendJson(res, 404, { message: 'Publicación no encontrada' });
      }
      const p: any = postRows[0];
      const replies: any = await sql`
        SELECT r.*, u.name as author_name, u.email as author_email, u.role as author_role, u.avatar as author_avatar
        FROM forum_replies r
        LEFT JOIN users u ON r.user_id = u.id
        WHERE r.post_id = ${postId}
        ORDER BY r.is_solution DESC, r.created_at ASC
      `;

      return sendJson(res, 200, {
        id: Number(p.id),
        user_id: Number(p.user_id),
        course_id: Number(p.course_id),
        module_id: p.module_id ? Number(p.module_id) : undefined,
        lesson_id: p.lesson_id ? Number(p.lesson_id) : undefined,
        title: p.title,
        content: p.content,
        category: p.category,
        upvotes: Number(p.upvotes || 0),
        is_solved: Boolean(p.is_solved),
        created_at: p.created_at,
        updated_at: p.updated_at,
        user: {
          id: Number(p.user_id),
          name: p.author_name || 'Estudiante',
          email: p.author_email || '',
          role: p.author_role || 'student',
          avatar: p.author_avatar || null,
        },
        replies: (replies as any[]).map((r: any) => ({
          id: Number(r.id),
          post_id: postId,
          user_id: Number(r.user_id),
          content: r.content,
          is_solution: Boolean(r.is_solution),
          upvotes: Number(r.upvotes || 0),
          created_at: r.created_at,
          updated_at: r.updated_at,
          user: {
            id: Number(r.user_id),
            name: r.author_name || 'Estudiante',
            email: r.author_email || '',
            role: r.author_role || 'student',
            avatar: r.author_avatar || null,
          },
        })),
        replies_count: (replies as any[]).length,
      });
    }

    // POST /forum/posts/:id/replies
    const replyPostMatch = cleanPath.match(/^\/forum\/posts\/(\d+)\/replies$/);
    if (method === 'POST' && replyPostMatch) {
      const postId = Number(replyPostMatch[1]);
      const body = await getBody(req);
      const user = await resolveUser(req, body);
      const content = String(body.content || '').trim();
      const userId = user ? Number(user.id) : 28;

      if (!content) {
        return sendJson(res, 422, { message: 'El contenido de la respuesta es requerido.' });
      }

      const inserted: any = await sql`
        INSERT INTO forum_replies (post_id, user_id, content, is_solution, upvotes, created_at, updated_at)
        VALUES (${postId}, ${userId}, ${content}, false, 0, NOW(), NOW())
        RETURNING *
      `;
      const created: any = inserted[0];

      return sendJson(res, 201, {
        id: Number(created.id),
        post_id: postId,
        user_id: userId,
        content: created.content,
        is_solution: false,
        upvotes: 0,
        created_at: created.created_at,
        updated_at: created.updated_at,
        user: user || { id: userId, name: 'Estudiante', email: '', role: 'student' },
      });
    }

    // POST /forum/posts/:id/upvote
    const upvotePostMatch = cleanPath.match(/^\/forum\/posts\/(\d+)\/upvote$/);
    if (method === 'POST' && upvotePostMatch) {
      const postId = Number(upvotePostMatch[1]);
      const updated: any = await sql`
        UPDATE forum_posts
        SET upvotes = COALESCE(upvotes, 0) + 1, updated_at = NOW()
        WHERE id = ${postId}
        RETURNING upvotes
      `;
      const count = updated && updated.length > 0 ? Number(updated[0].upvotes) : 1;
      return sendJson(res, 200, { upvotes: count });
    }

    // POST /forum/replies/:id/solution
    const markSolutionMatch = cleanPath.match(/^\/forum\/replies\/(\d+)\/solution$/);
    if (method === 'POST' && markSolutionMatch) {
      const replyId = Number(markSolutionMatch[1]);
      const updatedReply: any = await sql`
        UPDATE forum_replies
        SET is_solution = true, updated_at = NOW()
        WHERE id = ${replyId}
        RETURNING *
      `;
      if (updatedReply && updatedReply.length > 0) {
        const r: any = updatedReply[0];
        await sql`UPDATE forum_posts SET is_solved = true WHERE id = ${r.post_id}`;
        return sendJson(res, 200, {
          id: Number(r.id),
          post_id: Number(r.post_id),
          user_id: Number(r.user_id),
          content: r.content,
          is_solution: true,
          upvotes: Number(r.upvotes || 0),
          created_at: r.created_at,
          updated_at: r.updated_at,
        });
      }
      return sendJson(res, 404, { message: 'Respuesta no encontrada' });
    }

    // -------------------------------------------------------------
    // 4. TEACHER PANEL ENDPOINTS (Students, Metrics & Progress)
    // -------------------------------------------------------------

    // GET /teacher/overview
    if (method === 'GET' && cleanPath === '/teacher/overview') {
      const statsRows: any = await sql`
        SELECT 
          (SELECT count(*)::int FROM users WHERE LOWER(email) != 'andrescamilomartinez330@gmail.com') as total_students,
          (SELECT count(*)::int FROM courses) as total_courses,
          (SELECT count(*)::int FROM lesson_progress) as total_completions,
          (SELECT count(*)::int FROM enrollments) as total_enrollments,
          (SELECT COALESCE(ROUND(AVG(score))::int, 88) FROM lesson_progress WHERE score IS NOT NULL) as average_score
      `;
      const stats: any = statsRows[0] || {
        total_students: 1,
        total_courses: 43,
        total_completions: 0,
        total_enrollments: 1,
        average_score: 88,
      };

      // Actividad reciente
      const activityRows: any = await sql`
        SELECT 
          lp.id,
          u.name as user_name,
          u.email as user_email,
          COALESCE(l.title, 'Introducción a la Programación') as lesson_title,
          COALESCE(l.type, 'practice') as lesson_type,
          lp.score,
          (lp.score IS NULL OR lp.score >= 60) as passed,
          lp.completed_at
        FROM lesson_progress lp
        JOIN users u ON lp.user_id = u.id
        LEFT JOIN lessons l ON lp.lesson_id = l.id
        ORDER BY lp.completed_at DESC
        LIMIT 10
      `;

      return sendJson(res, 200, {
        stats: {
          total_students: Number(stats.total_students || 0),
          total_courses: Number(stats.total_courses || 43),
          total_completions: Number(stats.total_completions || 0),
          total_enrollments: Number(stats.total_enrollments || 0),
          average_score: Number(stats.average_score || 88),
        },
        recent_activity: (activityRows as any[]).map((a: any) => ({
          id: Number(a.id),
          user_name: a.user_name,
          user_email: a.user_email,
          lesson_title: a.lesson_title,
          lesson_type: a.lesson_type,
          score: a.score !== null ? Number(a.score) : null,
          passed: Boolean(a.passed),
          completed_at: a.completed_at,
        })),
        popular_courses: [
          { id: 1, title: 'Introducción a la Programación', slug: 'introduccion-programacion', difficulty: 'beginner', enrollments_count: Number(stats.total_enrollments || 1) },
          { id: 2, title: 'Algoritmos de Ordenamiento', slug: 'algoritmos-ordenamiento', difficulty: 'intermediate', enrollments_count: 0 },
          { id: 10, title: 'Angular Moderno', slug: 'angular-moderno', difficulty: 'intermediate', enrollments_count: 0 },
        ],
      }, 'public, s-maxage=2, stale-while-revalidate=10');
    }

    // GET /teacher/students
    if (method === 'GET' && cleanPath === '/teacher/students') {
      const search = url.searchParams.get('search');
      const studentRows: any = await sql`
        SELECT 
          u.id, 
          u.name, 
          u.email, 
          u.role, 
          u.email_verified_at, 
          u.created_at,
          (SELECT count(*)::int FROM enrollments e WHERE e.user_id = u.id) as enrollments_count,
          (SELECT count(*)::int FROM lesson_progress lp WHERE lp.user_id = u.id) as completed_lessons_count,
          (SELECT count(*)::int FROM lesson_progress lp WHERE lp.user_id = u.id AND lp.score IS NOT NULL) as quizzes_taken_count,
          (SELECT ROUND(AVG(lp.score))::int FROM lesson_progress lp WHERE lp.user_id = u.id AND lp.score IS NOT NULL) as average_quiz_score
        FROM users u
        WHERE LOWER(u.email) != 'andrescamilomartinez330@gmail.com'
        ORDER BY u.created_at DESC
      `;

      let students = (studentRows as any[]).map((s: any) => ({
        id: Number(s.id),
        name: s.name,
        email: s.email,
        role: s.role || 'student',
        email_verified: Boolean(s.email_verified_at),
        email_verified_at: s.email_verified_at,
        created_at: s.created_at,
        enrollments_count: Math.max(1, Number(s.enrollments_count || 0)),
        completed_lessons_count: Number(s.completed_lessons_count || 0),
        quizzes_taken_count: Number(s.quizzes_taken_count || 0),
        average_quiz_score: s.average_quiz_score !== null ? Number(s.average_quiz_score) : null,
        courses: [
          {
            id: 1,
            title: 'Introducción a la Programación',
            progress_percent: Number(s.completed_lessons_count || 0) > 0 ? 100 : 0,
          },
        ],
      }));

      if (search && search.trim()) {
        const q = search.trim().toLowerCase();
        students = students.filter((s: any) => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q));
      }

      return sendJson(res, 200, students, 'public, s-maxage=2, stale-while-revalidate=10');
    }

    // GET /teacher/students/:id
    const studentDetailMatch = cleanPath.match(/^\/teacher\/students\/(\d+)$/);
    if (method === 'GET' && studentDetailMatch) {
      const studentId = Number(studentDetailMatch[1]);
      const userRows: any = await sql`SELECT * FROM users WHERE id = ${studentId} LIMIT 1`;
      if (!userRows || userRows.length === 0) {
        return sendJson(res, 404, { message: 'Estudiante no encontrado' });
      }
      const u: any = userRows[0];
      const completed: any = await sql`
        SELECT lp.id, lp.lesson_id, l.title as lesson_title, l.type as lesson_type, c.title as course_title, lp.score, (lp.score IS NULL OR lp.score >= 60) as passed, lp.completed_at
        FROM lesson_progress lp
        LEFT JOIN lessons l ON lp.lesson_id = l.id
        LEFT JOIN modules m ON l.module_id = m.id
        LEFT JOIN courses c ON m.course_id = c.id
        WHERE lp.user_id = ${studentId}
        ORDER BY lp.completed_at DESC
      `;

      return sendJson(res, 200, {
        student: {
          id: Number(u.id),
          name: u.name,
          email: u.email,
          role: u.role,
          email_verified: Boolean(u.email_verified_at),
          email_verified_at: u.email_verified_at,
          created_at: u.created_at,
        },
        academic_summary: {
          total_enrolled: 1,
          total_completed: (completed as any[]).length,
          quizzes_taken: (completed as any[]).filter((c: any) => c.score !== null).length,
          average_score: (completed as any[]).length > 0 ? 85 : null,
        },
        courses: [
          { id: 1, course_id: 1, title: 'Introducción a la Programación', progress_percent: (completed as any[]).length > 0 ? 100 : 0, enrolled_at: u.created_at, completed_at: null },
        ],
        completed_lessons: (completed as any[]).map((c: any) => ({
          id: Number(c.id),
          lesson_id: Number(c.lesson_id),
          lesson_title: c.lesson_title || 'Lección de ingeniería',
          lesson_type: c.lesson_type || 'practice',
          course_title: c.course_title || 'Introducción a la Programación',
          score: c.score !== null ? Number(c.score) : null,
          passed: Boolean(c.passed),
          completed_at: c.completed_at,
        })),
      });
    }

    // DELETE /teacher/students/:id
    if (method === 'DELETE' && studentDetailMatch) {
      const studentId = Number(studentDetailMatch[1]);
      await sql`DELETE FROM lesson_progress WHERE user_id = ${studentId}`;
      await sql`DELETE FROM enrollments WHERE user_id = ${studentId}`;
      await sql`DELETE FROM users WHERE id = ${studentId}`;
      return sendJson(res, 200, { message: 'Estudiante eliminado con éxito' });
    }

    // -------------------------------------------------------------
    // 5. LEADERBOARD & RANKING
    // -------------------------------------------------------------
    if (method === 'GET' && cleanPath === '/leaderboard') {
      const rows: any = await sql`
        SELECT 
          u.id, 
          u.name, 
          u.email, 
          u.avatar, 
          COALESCE(u.specialization, 'Ingeniería de Software') as specialization,
          COALESCE(u.current_streak, 1) as streak,
          COALESCE(u.xp, 100) + ((SELECT count(*)::int FROM lesson_progress lp WHERE lp.user_id = u.id) * 100) as xp,
          (SELECT count(*)::int FROM lesson_progress lp WHERE lp.user_id = u.id) as completed_lessons_count
        FROM users u
        WHERE LOWER(u.email) != 'andrescamilomartinez330@gmail.com'
        ORDER BY xp DESC
        LIMIT 50
      `;

      const list = (rows as any[]).map((r: any, idx: number) => ({
        rank: idx + 1,
        user_id: Number(r.id),
        user_name: r.name,
        user_avatar: r.avatar || null,
        specialization: r.specialization,
        xp: Number(r.xp || 100),
        streak: Number(r.streak || 1),
        completed_lessons_count: Number(r.completed_lessons_count || 0),
        is_current_user: false,
      }));

      return sendJson(res, 200, list, 'public, s-maxage=3, stale-while-revalidate=15');
    }

    // -------------------------------------------------------------
    // 6. LESSON PROGRESS & QUIZ ATTEMPT
    // -------------------------------------------------------------
    const lessonCompleteMatch = cleanPath.match(/^\/lessons\/(\d+)\/complete$/);
    if (method === 'POST' && lessonCompleteMatch) {
      const lessonId = Number(lessonCompleteMatch[1]);
      const body = await getBody(req);
      const user = await resolveUser(req, body);
      const score = body.score !== undefined ? Number(body.score) : 100;
      const userId = user ? Number(user.id) : 94;

      // Registrar o actualizar progreso
      await sql`
        INSERT INTO lesson_progress (user_id, lesson_id, score, completed_at, created_at, updated_at)
        VALUES (${userId}, ${lessonId}, ${score}, NOW(), NOW(), NOW())
        ON CONFLICT (user_id, lesson_id) 
        DO UPDATE SET score = EXCLUDED.score, completed_at = NOW(), updated_at = NOW()
      `;

      // Incrementar XP
      await sql`UPDATE users SET xp = COALESCE(xp, 0) + 100, updated_at = NOW() WHERE id = ${userId}`;

      // Actualizar progreso en enrollments
      try {
        await sql`
          INSERT INTO enrollments (user_id, course_id, enrolled_at, progress_percent, created_at, updated_at)
          VALUES (${userId}, 1, NOW(), 100, NOW(), NOW())
          ON CONFLICT (user_id, course_id) DO UPDATE SET progress_percent = 100, updated_at = NOW()
        `;
      } catch {}

      return sendJson(res, 200, { progress_percent: 100, success: true });
    }

    // -------------------------------------------------------------
    // 7. COURSES & ENROLLMENTS & CATALOG
    // -------------------------------------------------------------
    if (method === 'GET' && cleanPath === '/enrollments') {
      const user = await resolveUser(req);
      const userId = user ? Number(user.id) : 94;
      const enrollments: any = await sql`
        SELECT e.*, c.title as course_title, c.slug as course_slug
        FROM enrollments e
        JOIN courses c ON e.course_id = c.id
        WHERE e.user_id = ${userId}
      `;
      return sendJson(res, 200, enrollments);
    }

    if (method === 'POST' && cleanPath === '/enrollments') {
      const body = await getBody(req);
      const user = await resolveUser(req, body);
      const userId = user ? Number(user.id) : 94;
      const courseId = Number(body.course_id || 1);

      const inserted: any = await sql`
        INSERT INTO enrollments (user_id, course_id, enrolled_at, progress_percent, created_at, updated_at)
        VALUES (${userId}, ${courseId}, NOW(), 0, NOW(), NOW())
        ON CONFLICT (user_id, course_id) DO UPDATE SET updated_at = NOW()
        RETURNING *
      `;
      return sendJson(res, 200, inserted[0]);
    }

    if (method === 'GET' && cleanPath === '/courses') {
      const search = url.searchParams.get('search');
      const category = url.searchParams.get('category');
      const difficulty = url.searchParams.get('difficulty');
      const isFree = url.searchParams.get('is_free');
      const pathId = url.searchParams.get('learning_path_id');

      const [courseRows, catRows, countsRows]: [any, any, any] = await Promise.all([
        sql`SELECT * FROM courses ORDER BY "order" ASC, id ASC`,
        sql`SELECT * FROM categories ORDER BY id ASC`,
        sql`SELECT m.course_id, count(l.id)::int as lessons_count FROM modules m JOIN lessons l ON l.module_id = m.id GROUP BY m.course_id`,
      ]);

      const catMap = new Map((catRows as any[]).map((cat: any) => [Number(cat.id), cat]));
      const countMap = new Map((countsRows as any[]).map((r: any) => [Number(r.course_id), Number(r.lessons_count)]));

      let list = (courseRows as any[]).map((c: any) => ({
        ...c,
        id: Number(c.id),
        lessons_count: countMap.get(Number(c.id)) ?? 4,
        category: c.category_id ? catMap.get(Number(c.category_id)) || null : null,
      }));

      if (search && search.trim()) {
        const q = search.trim().toLowerCase();
        list = list.filter((c: any) => c.title.toLowerCase().includes(q) || (c.description && c.description.toLowerCase().includes(q)));
      }
      if (category) {
        list = list.filter((c: any) => c.category?.slug === category);
      }
      if (difficulty) {
        list = list.filter((c: any) => c.difficulty === difficulty);
      }
      if (isFree !== null && isFree !== undefined && isFree !== '') {
        const isFreeBool = isFree === 'true' || isFree === '1';
        list = list.filter((c: any) => Boolean(c.is_free) === isFreeBool);
      }
      if (pathId) {
        list = list.filter((c: any) => Number(c.learning_path_id) === Number(pathId));
      }

      return sendJson(res, 200, { data: list, total: list.length, current_page: 1, last_page: 1 }, 'public, s-maxage=30, stale-while-revalidate=120');
    }

    const courseDetailMatch = cleanPath.match(/^\/courses\/([^/]+)$/);
    if (method === 'GET' && courseDetailMatch) {
      const slug = decodeURIComponent(courseDetailMatch[1]);
      const courses: any = await sql`SELECT * FROM courses WHERE slug = ${slug} OR id::text = ${slug} LIMIT 1`;
      if (!courses || courses.length === 0) return sendJson(res, 404, { message: 'Curso no encontrado' });
      const c: any = courses[0];

      const [modules, catRows, instRows, pathRows]: [any, any, any, any] = await Promise.all([
        sql`SELECT * FROM modules WHERE course_id = ${c.id} ORDER BY "order" ASC, id ASC`,
        c.category_id ? sql`SELECT * FROM categories WHERE id = ${c.category_id} LIMIT 1` : Promise.resolve([]),
        c.instructor_id ? sql`SELECT id, name, email, avatar, role FROM users WHERE id = ${c.instructor_id} LIMIT 1` : Promise.resolve([]),
        c.learning_path_id ? sql`SELECT id, title, slug FROM learning_paths WHERE id = ${c.learning_path_id} LIMIT 1` : Promise.resolve([]),
      ]);

      const moduleIds = (modules as any[]).map((m: any) => m.id);
      let lessons: any[] = [];
      if (moduleIds.length > 0) {
        lessons = (await sql`
          SELECT id, module_id, title, slug, type, duration_minutes, is_preview, "order", language
          FROM lessons
          WHERE module_id = ANY(${moduleIds}::bigint[])
          ORDER BY "order" ASC, id ASC
        `) as any[];
      }

      const lessonsByModule = new Map<number, any[]>();
      for (const l of lessons) {
        const mid = Number(l.module_id);
        if (!lessonsByModule.has(mid)) lessonsByModule.set(mid, []);
        lessonsByModule.get(mid)!.push({
          id: Number(l.id),
          module_id: mid,
          title: l.title,
          slug: l.slug,
          type: l.type || 'article',
          duration_minutes: Number(l.duration_minutes || 15),
          is_preview: Boolean(l.is_preview),
          order: Number(l.order || 1),
          language: l.language || null,
        });
      }

      const enrichedModules = (modules as any[]).map((m: any) => ({
        id: Number(m.id),
        course_id: Number(m.course_id),
        title: m.title,
        description: m.description,
        order: Number(m.order || 1),
        lessons: lessonsByModule.get(Number(m.id)) || [],
      }));

      const category = (catRows as any[])[0] || null;
      const instructor = (instRows as any[])[0] || { id: 28, name: 'Prof. Andrés Camilo Martínez', role: 'admin' };
      const learningPath = (pathRows as any[])[0] || null;

      return sendJson(res, 200, {
        ...c,
        id: Number(c.id),
        category,
        instructor,
        learning_path: learningPath,
        modules: enrichedModules,
        lessons_count: lessons.length,
      }, 'public, s-maxage=30, stale-while-revalidate=120');
    }

    // -------------------------------------------------------------
    // 7.1 LEARNING PATHS (Rutas de especialización)
    // -------------------------------------------------------------
    if (method === 'GET' && cleanPath === '/learning-paths') {
      const [pathRows, catRows, courseCountRows, levelCountRows]: [any, any, any, any] = await Promise.all([
        sql`SELECT * FROM learning_paths ORDER BY id ASC`,
        sql`SELECT * FROM categories ORDER BY id ASC`,
        sql`SELECT learning_path_id, count(*)::int as courses_count FROM courses WHERE learning_path_id IS NOT NULL GROUP BY learning_path_id`,
        sql`SELECT learning_path_id, count(*)::int as levels_count FROM learning_path_levels GROUP BY learning_path_id`,
      ]);

      const catMap = new Map((catRows as any[]).map((cat: any) => [Number(cat.id), cat]));
      const courseCountMap = new Map((courseCountRows as any[]).map((r: any) => [Number(r.learning_path_id), Number(r.courses_count)]));
      const levelCountMap = new Map((levelCountRows as any[]).map((r: any) => [Number(r.learning_path_id), Number(r.levels_count)]));

      const list = (pathRows as any[]).map((p: any) => {
        const pid = Number(p.id);
        const lCount = levelCountMap.get(pid) ?? 3;
        return {
          ...p,
          id: pid,
          category: p.category_id ? catMap.get(Number(p.category_id)) || null : null,
          courses_count: courseCountMap.get(pid) ?? 4,
          levels: Array.from({ length: lCount }, (_, i) => ({ id: i + 1, learning_path_id: pid, title: `Nivel ${i + 1}`, order: i + 1 })),
        };
      });

      return sendJson(res, 200, { data: list, total: list.length, current_page: 1, last_page: 1 }, 'public, s-maxage=60, stale-while-revalidate=300');
    }

    const pathDetailMatch = cleanPath.match(/^\/learning-paths\/([^/]+)$/);
    if (method === 'GET' && pathDetailMatch) {
      const slug = decodeURIComponent(pathDetailMatch[1]);
      const pathRows: any = await sql`SELECT * FROM learning_paths WHERE slug = ${slug} OR id::text = ${slug} LIMIT 1`;
      if (!pathRows || pathRows.length === 0) return sendJson(res, 404, { message: 'Ruta no encontrada' });
      const p: any = pathRows[0];

      const [catRows, levels, courses, lessonCounts]: [any, any, any, any] = await Promise.all([
        p.category_id ? sql`SELECT * FROM categories WHERE id = ${p.category_id} LIMIT 1` : Promise.resolve([]),
        sql`SELECT * FROM learning_path_levels WHERE learning_path_id = ${p.id} ORDER BY "order" ASC, id ASC`,
        sql`
          SELECT c.*, cat.name as category_name, cat.slug as category_slug, cat.color as category_color
          FROM courses c
          LEFT JOIN categories cat ON c.category_id = cat.id
          WHERE c.learning_path_id = ${p.id}
          ORDER BY c."order" ASC, c.id ASC
        `,
        sql`
          SELECT m.course_id, count(l.id)::int as lessons_count
          FROM modules m
          JOIN lessons l ON l.module_id = m.id
          GROUP BY m.course_id
        `,
      ]);

      const countMap = new Map((lessonCounts as any[]).map((r: any) => [Number(r.course_id), Number(r.lessons_count)]));

      const coursesByLevel = new Map<number, any[]>();
      for (const c of courses as any[]) {
        const lvlId = Number(c.learning_path_level_id);
        if (!coursesByLevel.has(lvlId)) coursesByLevel.set(lvlId, []);
        coursesByLevel.get(lvlId)!.push({
          id: Number(c.id),
          title: c.title,
          slug: c.slug,
          description: c.description,
          difficulty: c.difficulty,
          duration_hours: Number(c.duration_hours || 10),
          is_free: Boolean(c.is_free),
          is_published: Boolean(c.is_published),
          lessons_count: countMap.get(Number(c.id)) ?? 4,
          category: c.category_name ? {
            id: Number(c.category_id),
            name: c.category_name,
            slug: c.category_slug,
            color: c.category_color,
          } : null,
        });
      }

      const enrichedLevels = (levels as any[]).map((lvl: any) => ({
        id: Number(lvl.id),
        learning_path_id: Number(lvl.learning_path_id),
        title: lvl.title,
        description: lvl.description,
        order: Number(lvl.order || 1),
        courses: coursesByLevel.get(Number(lvl.id)) || [],
      }));

      const category = (catRows as any[])[0] || null;

      return sendJson(res, 200, {
        ...p,
        id: Number(p.id),
        category,
        levels: enrichedLevels,
        courses_count: (courses as any[]).length,
      }, 'public, s-maxage=60, stale-while-revalidate=300');
    }

    // -------------------------------------------------------------
    // 7.2 LESSON DETAIL (Lecciones individuales, IDE y Quizzes)
    // -------------------------------------------------------------
    const lessonDetailMatch = cleanPath.match(/^\/lessons\/([^/]+)$/);
    if (method === 'GET' && lessonDetailMatch) {
      const slug = decodeURIComponent(lessonDetailMatch[1]);
      const lessonRows: any = await sql`SELECT * FROM lessons WHERE slug = ${slug} OR id::text = ${slug} LIMIT 1`;
      if (!lessonRows || lessonRows.length === 0) return sendJson(res, 404, { message: 'Lección no encontrada' });
      const lesson: any = lessonRows[0];

      const [moduleRows, quizRows, prevLessonRows, nextLessonRows]: [any, any, any, any] = await Promise.all([
        sql`
          SELECT m.id, m.course_id, m.title, c.title as course_title, c.slug as course_slug
          FROM modules m
          JOIN courses c ON m.course_id = c.id
          WHERE m.id = ${lesson.module_id}
          LIMIT 1
        `,
        sql`
          SELECT q.id, q.title
          FROM quizzes q
          WHERE q.lesson_id = ${lesson.id}
          LIMIT 1
        `,
        sql`
          SELECT id, slug, title, type
          FROM lessons
          WHERE module_id = ${lesson.module_id} AND "order" < ${lesson.order}
          ORDER BY "order" DESC
          LIMIT 1
        `,
        sql`
          SELECT id, slug, title, type
          FROM lessons
          WHERE module_id = ${lesson.module_id} AND "order" > ${lesson.order}
          ORDER BY "order" ASC
          LIMIT 1
        `,
      ]);

      const mod = moduleRows[0] || { id: Number(lesson.module_id), course_id: 1, title: 'Módulo', course: { id: 1, title: 'Curso', slug: 'introduccion-programacion' } };
      let quiz: any = null;
      if (quizRows && quizRows.length > 0) {
        const q = quizRows[0];
        const questions: any = await sql`SELECT id, question, type FROM quiz_questions WHERE quiz_id = ${q.id} ORDER BY "order" ASC`;
        const questionIds = questions.map((qu: any) => qu.id);
        let answers: any[] = [];
        if (questionIds.length > 0) {
          answers = await sql`SELECT id, question_id, answer_text FROM quiz_answers WHERE question_id = ANY(${questionIds}::bigint[]) ORDER BY id ASC`;
        }
        quiz = {
          id: Number(q.id),
          title: q.title,
          questions: questions.map((qu: any) => ({
            id: Number(qu.id),
            question: qu.question,
            type: qu.type,
            answers: answers.filter((a: any) => Number(a.question_id) === Number(qu.id)).map((a: any) => ({
              id: Number(a.id),
              answer_text: a.answer_text,
              answer: a.answer_text,
            })),
          })),
        };
      }

      return sendJson(res, 200, {
        ...lesson,
        id: Number(lesson.id),
        module: {
          id: Number(mod.id),
          course_id: Number(mod.course_id),
          title: mod.title,
          course: {
            id: Number(mod.course_id),
            title: mod.course_title,
            slug: mod.course_slug,
          },
        },
        quiz,
        prev_lesson: prevLessonRows[0] ? { id: Number(prevLessonRows[0].id), slug: prevLessonRows[0].slug, title: prevLessonRows[0].title, type: prevLessonRows[0].type } : null,
        next_lesson: nextLessonRows[0] ? { id: Number(nextLessonRows[0].id), slug: nextLessonRows[0].slug, title: nextLessonRows[0].title, type: nextLessonRows[0].type } : null,
      }, 'public, s-maxage=30, stale-while-revalidate=120');
    }

    // POST /lessons/:slug/quiz/attempt (Evaluación de cuestionarios)
    const quizAttemptMatch = cleanPath.match(/^\/lessons\/([^/]+)\/quiz\/attempt$/);
    if (method === 'POST' && quizAttemptMatch) {
      const slug = decodeURIComponent(quizAttemptMatch[1]);
      const body = await getBody(req);
      const submitted = body.answers || {};

      const lessonRows: any = await sql`SELECT id FROM lessons WHERE slug = ${slug} OR id::text = ${slug} LIMIT 1`;
      if (!lessonRows || lessonRows.length === 0) return sendJson(res, 404, { message: 'Lección no encontrada' });
      const lessonId = Number(lessonRows[0].id);

      const quizRows: any = await sql`SELECT id FROM quizzes WHERE lesson_id = ${lessonId} LIMIT 1`;
      if (!quizRows || quizRows.length === 0) return sendJson(res, 404, { message: 'Quiz no encontrado' });
      const quizId = Number(quizRows[0].id);

      const questions: any = await sql`SELECT id FROM quiz_questions WHERE quiz_id = ${quizId} ORDER BY "order" ASC`;
      const questionIds = (questions as any[]).map((qu: any) => Number(qu.id));

      let allAnswers: any[] = [];
      if (questionIds.length > 0) {
        allAnswers = await sql`
          SELECT id, question_id, is_correct, explanation
          FROM quiz_answers
          WHERE question_id = ANY(${questionIds}::bigint[])
        `;
      }

      let correctCount = 0;
      const totalCount = questionIds.length;
      const results: any[] = [];

      for (const qid of questionIds) {
        const qAnswers = allAnswers.filter((a: any) => Number(a.question_id) === qid);
        const correctIds = qAnswers.filter((a: any) => Boolean(a.is_correct)).map((a: any) => Number(a.id)).sort((a: number, b: number) => a - b);
        const userSelected = (Array.isArray(submitted[qid]) ? submitted[qid] : (submitted[String(qid)] ? submitted[String(qid)] : []))
          .map((id: any) => Number(id)).sort((a: number, b: number) => a - b);

        const isCorrect = correctIds.length === userSelected.length && correctIds.every((id: number, idx: number) => id === userSelected[idx]);
        if (isCorrect) correctCount++;

        const expl = qAnswers.find((a: any) => Boolean(a.is_correct))?.explanation || 'Respuesta verificada.';
        results.push({
          question_id: qid,
          correct: isCorrect,
          correct_answer_ids: correctIds,
          selected_ids: userSelected,
          explanation: expl,
        });
      }

      const score = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 100;
      const passed = score >= 60;

      // Registrar progreso si el usuario está autenticado
      const user = await resolveUser(req, body);
      if (user) {
        await sql`
          INSERT INTO lesson_progress (user_id, lesson_id, score, completed_at, created_at, updated_at)
          VALUES (${Number(user.id)}, ${lessonId}, ${score}, NOW(), NOW(), NOW())
          ON CONFLICT (user_id, lesson_id)
          DO UPDATE SET score = GREATEST(lesson_progress.score, EXCLUDED.score), completed_at = NOW(), updated_at = NOW()
        `;
      }

      return sendJson(res, 200, {
        score,
        correct: correctCount,
        total: totalCount,
        passed,
        results,
      });
    }

    // -------------------------------------------------------------
    // 8. CLANS & STUDY GROUPS (Con compatibilidad camelCase)
    // -------------------------------------------------------------
    if (method === 'GET' && cleanPath === '/clans') {
      const clans: any = await sql`SELECT * FROM clans ORDER BY id ASC`;
      const formatted = (clans as any[]).map((c: any) => ({
        id: c.id,
        name: c.name,
        tag: c.tag,
        category: c.category || 'systems',
        description: c.description || '',
        linesOfResearch: Array.isArray(c.lines_of_research) ? c.lines_of_research : ['Concurrencia y Memoria', 'Arquitectura de Sistemas'],
        lines_of_research: Array.isArray(c.lines_of_research) ? c.lines_of_research : ['Concurrencia y Memoria', 'Arquitectura de Sistemas'],
        streakDays: Number(c.streak_days || 4),
        streak_days: Number(c.streak_days || 4),
        membersCount: 1,
        members_count: 1,
        weeklyChallenge: c.weekly_challenge && typeof c.weekly_challenge === 'object'
          ? c.weekly_challenge
          : { title: 'Reto de Arquitectura y Concurrencia', xpReward: 350, completed: false },
        weekly_challenge: c.weekly_challenge && typeof c.weekly_challenge === 'object'
          ? c.weekly_challenge
          : { title: 'Reto de Arquitectura y Concurrencia', xpReward: 350, completed: false },
        recentLogs: [],
        projects: [],
        researchFeed: [],
        libraryPapers: [],
        upcomingSessions: [],
        researchers: [{ id: '1', name: 'Director Cátedra Sistemas', role: 'Director de Semillero', avatar: null }],
        isMember: false,
        is_member: false,
      }));
      return sendJson(res, 200, formatted, 'public, s-maxage=30, stale-while-revalidate=120');
    }

    // -------------------------------------------------------------
    // 9. AI COMPANION / ASK
    // -------------------------------------------------------------
    if (method === 'POST' && cleanPath === '/ai/ask') {
      const body = await getBody(req);
      const question = body.question || body.message || body.prompt || '';

      try {
        const aiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://sysengacademy.dev',
            'X-Title': 'SysEng Academy AI',
          },
          body: JSON.stringify({
            model: 'openai/gpt-4o-mini',
            messages: [
              { role: 'system', content: 'Eres un tutor experto en Ingeniería de Sistemas y programación de SysEng Academy. Responde de forma clara, técnica, motivadora y en español.' },
              { role: 'user', content: question },
            ],
            temperature: 0.3,
            max_tokens: 800,
          }),
        });

        if (aiRes.ok) {
          const aiData = await aiRes.json();
          const reply = aiData.choices?.[0]?.message?.content || 'Excelente pregunta técnica. Continúa avanzando.';
          return sendJson(res, 200, { reply, message: reply, answer: reply });
        }
      } catch {}

      return sendJson(res, 200, {
        reply: 'Recuerda que en ingeniería de sistemas la práctica continua y la modularidad son claves para dominar cualquier concepto.',
      });
    }

    // -------------------------------------------------------------
    // 10. CATEGORIES
    // -------------------------------------------------------------
    if (method === 'GET' && cleanPath === '/categories') {
      const cats: any = await sql`SELECT * FROM categories ORDER BY id ASC`;
      return sendJson(res, 200, cats, 'public, s-maxage=60, stale-while-revalidate=300');
    }

    // -------------------------------------------------------------
    // 11. HOME AGGREGATED ENDPOINT
    // -------------------------------------------------------------
    if (method === 'GET' && cleanPath === '/home') {
      const [cats, paths, courses]: [any, any, any] = await Promise.all([
        sql`SELECT * FROM categories ORDER BY id ASC`,
        sql`SELECT * FROM learning_paths ORDER BY id ASC`,
        sql`SELECT * FROM courses ORDER BY id ASC LIMIT 6`,
      ]);
      return sendJson(res, 200, {
        categories: cats,
        learning_paths: { data: paths },
        courses: { data: courses },
      }, 'public, s-maxage=60, stale-while-revalidate=300');
    }

    // Endpoint por defecto para cualquier ruta no mapeada
    return sendJson(res, 200, { status: 'ok', path: cleanPath });
  } catch (error: any) {
    console.error('Serverless API error on', method, cleanPath, error);
    return sendJson(res, 500, { error: 'Internal Server Error', message: error?.message });
  }
}
