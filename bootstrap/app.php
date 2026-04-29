<?php

use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\EnsureUserIsKine;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Spatie\Permission\Middleware\RoleMiddleware;
use Spatie\Permission\Middleware\PermissionMiddleware;
use Spatie\Permission\Middleware\RoleOrPermissionMiddleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->validateCsrfTokens(except: [
            'payments/webpay/return',
            'webpay/public/return',
            'payments/webpay/confirm',
            'certificacion/webpay/product'
        ]);

        $middleware->web(append: [
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
            \App\Http\Middleware\RedirectCajero::class,
        ]);
        $middleware->alias([
            'ensure.kine' => EnsureUserIsKine::class,
            'role' => RoleMiddleware::class,
            'permission' => PermissionMiddleware::class,
            'role_or_permission' =>RoleOrPermissionMiddleware::class,
      ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->render(function (\Spatie\Permission\Exceptions\UnauthorizedException $e, $request) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'No tienes los permisos necesarios para realizar esta acción.',
                    'required_roles' => $e->getRequiredRoles(),
                    'required_permissions' => $e->getRequiredPermissions(),
                ], 403);
            }

            return back()->with([
                'flash' => [
                    'error' => 'Acceso denegado: No tienes el rol o permiso adecuado para entrar aquí.'
                ]
            ]);
        });

        $exceptions->respond(function ($response, $e, $request) {
            if ($response->getStatusCode() === 419) {
                return back()->with([
                    'flash' => [
                        'error' => 'Tu sesión expiró por seguridad, pero hemos refrescado la página para ti.'
                    ]
                ]);
            }
            return $response;
        });
    })->create();
