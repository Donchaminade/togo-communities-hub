<?php

declare(strict_types=1);

namespace TCH;

/**
 * Resout la methode HTTP reelle (contournement Apache/Hostinger pour PUT/PATCH/DELETE).
 */
final class HttpMethod
{
    public static function resolve(): string
    {
        $method = strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? 'GET'));

        if ($method === 'POST') {
            $override = $_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE']
                ?? $_SERVER['HTTP_X_HTTP_METHOD']
                ?? null;

            if (is_string($override) && $override !== '') {
                $method = strtoupper($override);
            }
        }

        return $method;
    }
}
