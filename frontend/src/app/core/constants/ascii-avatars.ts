export const STUDENT_MINI_AVATARS: Record<string, string[]> = {
  cyber_cat: [
    ` /\\_/\\ \n( o.o )\n \\_v_/ `,
    ` /\\_/\\ \n( -.- )\n \\_v_/ `,
    ` /\\_/\\ \n( ^.^ )\n \\_o_/ `,
  ],
  syseng_bot: [
    `  /_/  \n( o.o )\n > ^ < `,
    `  /_/  \n( -.- )\n > ^ < `,
    `  \\_/  \n( ^.^ )\n > o < `,
  ],
  tux_linux: [
    ` .--. \n|o_o |\n|:_/ |`,
    ` .--. \n|-.- |\n|:_/ |`,
    ` .--. \n|^_^ |\n|:_/ |`,
  ],
  monolith_cli: [
    `+-----+\n|>_ []|\n+-----+`,
    `+-----+\n|>  []|\n+-----+`,
    `+-----+\n|>_ []|\n+-----+`,
  ],
  root_skull: [
    ` .---. \n|() ()|\n \\ ^ / `,
    ` .---. \n|(•)(•)|\n \\ ^ / `,
    ` .---. \n|(> <)|\n \\ - / `,
  ],
  code_wizard: [
    `  /\\   \n ( ^.^ )\n (_|_|_)`,
    `  /\\   \n ( -.- )\n (_|_|_)`,
    `  /\\   \n ( o.o )\n (_|_|_)`,
  ],
};

export const TEACHER_MINI_AVATARS: Record<string, string[]> = {
  professor_owl: [
    ` {o,o} \n /)  ) \n  " "  `,
    ` {-,o} \n /)  ) \n  " "  `,
    ` {^,^} \n /)  ) \n  " "  `,
  ],
  byte_daemon: [
    ` [o_o] \n <) (>\\\n  | |  `,
    ` [-_-] \n <) (>\\\n  | |  `,
    ` [^_^] \n <) (>\\\n  | |  `,
  ],
  grand_mentor: [
    ` .---. \n|[o][o]|\n \\ - / `,
    ` .---. \n|[-][-]\n \\ - / `,
    ` .---. \n|[^][^]|\n \\ o / `,
  ],
  chief_architect: [
    `+-----+\n|[CPU] |\n+-----+`,
    `+-----+\n|[EXEC]|\n+-----+`,
    `+-----+\n|[OK]  |\n+-----+`,
  ],
  faculty_server: [
    `+-----+\n|[SRV] |\n+-----+`,
    `+-----+\n|[LIVE]|\n+-----+`,
    `+-----+\n|[SYS] |\n+-----+`,
  ],
};

export function getStoredMiniAvatar(isTeacher: boolean): string {
  if (typeof window === 'undefined') {
    return isTeacher ? 'professor_owl' : 'cyber_cat';
  }
  const storageKey = isTeacher
    ? 'syseng_selected_teacher_ascii_avatar'
    : 'syseng_selected_ascii_avatar';
  const saved = localStorage.getItem(storageKey);
  const pool = isTeacher ? TEACHER_MINI_AVATARS : STUDENT_MINI_AVATARS;
  if (saved && pool[saved]) {
    return saved;
  }
  return isTeacher ? 'professor_owl' : 'cyber_cat';
}
