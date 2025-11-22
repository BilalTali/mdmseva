<?php

namespace App\Listeners;

use Illuminate\Auth\Events\Registered;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Support\Facades\Log;

class SendEmailVerificationNotification
{
    /**
     * Handle the event.
     */
    public function handle(Registered $event): void
    {
        if ($event->user instanceof MustVerifyEmail && !$event->user->hasVerifiedEmail()) {
            Log::info('Sending email verification notification', [
                'user_id' => $event->user->id,
                'email' => $event->user->email,
            ]);
            
            $event->user->sendEmailVerificationNotification();
            
            Log::info('Email verification notification sent', [
                'user_id' => $event->user->id,
            ]);
        }
    }
}