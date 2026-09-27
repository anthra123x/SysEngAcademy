<?php

namespace App\Services;

final class LanguageRegistry
{
    /**
     * @return array<int, array{id: string, label: string, mode: string, sample: string, engine: 'local'|'piston', piston_runtime?: string, piston_version?: string}>
     */
    public static function all(): array
    {
        return [
            [
                'id' => 'pseint',
                'label' => 'PSeInt',
                'mode' => 'pseint',
                'sample' => self::pseintSample(),
                'engine' => 'local',
            ],
            [
                'id' => 'php',
                'label' => 'PHP',
                'mode' => 'php',
                'sample' => self::phpSample(),
                'engine' => 'piston',
                'piston_runtime' => 'php',
                'piston_version' => '8.2.0',
            ],
            [
                'id' => 'python',
                'label' => 'Python',
                'mode' => 'python',
                'sample' => self::pythonSample(),
                'engine' => 'piston',
                'piston_runtime' => 'python',
                'piston_version' => '3.10.0',
            ],
            [
                'id' => 'javascript',
                'label' => 'JavaScript',
                'mode' => 'javascript',
                'sample' => self::javascriptSample(),
                'engine' => 'piston',
                'piston_runtime' => 'nodejs',
                'piston_version' => '18.15.0',
            ],
            [
                'id' => 'typescript',
                'label' => 'TypeScript',
                'mode' => 'typescript',
                'sample' => self::typescriptSample(),
                'engine' => 'piston',
                'piston_runtime' => 'typescript',
                'piston_version' => '5.0.0',
            ],
            [
                'id' => 'c',
                'label' => 'C',
                'mode' => 'c',
                'sample' => self::cSample(),
                'engine' => 'piston',
                'piston_runtime' => 'c',
                'piston_version' => '10.2.0',
            ],
            [
                'id' => 'cpp',
                'label' => 'C++',
                'mode' => 'cpp',
                'sample' => self::cppSample(),
                'engine' => 'piston',
                'piston_runtime' => 'cpp',
                'piston_version' => '10.2.0',
            ],
            [
                'id' => 'java',
                'label' => 'Java',
                'mode' => 'java',
                'sample' => self::javaSample(),
                'engine' => 'piston',
                'piston_runtime' => 'java',
                'piston_version' => '17.0.0',
            ],
            [
                'id' => 'sql',
                'label' => 'SQL',
                'mode' => 'sql',
                'sample' => self::sqlSample(),
                'engine' => 'piston',
                'piston_runtime' => 'sqlite',
                'piston_version' => '3.39.0',
            ],
            [
                'id' => 'bash',
                'label' => 'Bash',
                'mode' => 'shell',
                'sample' => self::bashSample(),
                'engine' => 'piston',
                'piston_runtime' => 'bash',
                'piston_version' => '5.2.0',
            ],
        ];
    }

    /**
     * @return array<string, array{id: string, label: string, mode: string, sample: string, engine: 'local'|'piston', piston_runtime?: string, piston_version?: string}>
     */
    public static function keyed(): array
    {
        $keyed = [];
        foreach (self::all() as $lang) {
            $keyed[$lang['id']] = $lang;
        }

        return $keyed;
    }

    public static function get(string $id): ?array
    {
        return self::keyed()[$id] ?? null;
    }

    public static function isLocal(string $id): bool
    {
        $lang = self::get($id);

        return $lang !== null && $lang['engine'] === 'local';
    }

    public static function isPiston(string $id): bool
    {
        $lang = self::get($id);

        return $lang !== null && $lang['engine'] === 'piston';
    }

    private static function pseintSample(): string
    {
        return <<<'CODE'
Algoritmo HolaMundo
    Escribir "¡Hola, mundo!"
FinAlgoritmo
CODE;
    }

    private static function phpSample(): string
    {
        return <<<'CODE'
<?php
echo "¡Hola, mundo!\n";
CODE;
    }

    private static function pythonSample(): string
    {
        return <<<'CODE'
print("¡Hola, mundo!")
CODE;
    }

    private static function javascriptSample(): string
    {
        return <<<'CODE'
console.log("¡Hola, mundo!");
CODE;
    }

    private static function typescriptSample(): string
    {
        return <<<'CODE'
console.log("¡Hola, mundo!");
CODE;
    }

    private static function cSample(): string
    {
        return <<<'CODE'
#include <stdio.h>

int main() {
    printf("¡Hola, mundo!\n");
    return 0;
}
CODE;
    }

    private static function cppSample(): string
    {
        return <<<'CODE'
#include <iostream>

int main() {
    std::cout << "¡Hola, mundo!" << std::endl;
    return 0;
}
CODE;
    }

    private static function javaSample(): string
    {
        return <<<'CODE'
public class Main {
    public static void main(String[] args) {
        System.out.println("¡Hola, mundo!");
    }
}
CODE;
    }

    private static function sqlSample(): string
    {
        return <<<'CODE'
SELECT '¡Hola, mundo!' AS mensaje;
CODE;
    }

    private static function bashSample(): string
    {
        return <<<'CODE'
#!/bin/bash
echo "¡Hola, mundo!"
CODE;
    }
}
