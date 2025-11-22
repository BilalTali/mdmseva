<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Log;

class CustomVerifyEmail extends Notification
{
    use Queueable;

    /**
     * Get the notification's delivery channels.
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        Log::info('Building custom verification email', [
            'user_id' => $notifiable->id,
            'email' => $notifiable->email,
        ]);

        $verificationUrl = $this->verificationUrl($notifiable);

        Log::info('Verification URL generated', [
            'user_id' => $notifiable->id,
            'url_length' => strlen($verificationUrl),
        ]);

        return (new MailMessage)
            ->subject('Verify Your Email Address - MDM Seva')
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line('Thank you for registering with MDM Seva.')
            ->line('Please click the button below to verify your email address.')
            ->action('Verify Email Address', $verificationUrl)
            ->line('This link will expire in 60 minutes.')
            ->line('If you did not create an account, no further action is required.')
            ->salutation('Regards, MDM Seva Team');
    }

    /**
     * Get the verification URL for the given notifiable.
     */
    protected function verificationUrl($notifiable): string
    {
        $url = URL::temporarySignedRoute(
            'verification.verify',
            Carbon::now()->addMinutes(Config::get('auth.verification.expire', 60)),
            [
                'id' => $notifiable->getKey(),
                'hash' => sha1($notifiable->getEmailForVerification()),
            ]
        );

        Log::info('Verification URL created', [
            'user_id' => $notifiable->id,
            'url' => $url,
        ]);

        return $url;
    }
}