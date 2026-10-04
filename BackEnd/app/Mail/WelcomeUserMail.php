<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class WelcomeUserMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $toName,
        public string $toEmail,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'خوش آمدی به Taskline',
        );
    }

    public function content(): Content
    {
        return new Content(
            htmlString: $this->buildHtml(),
        );
    }

    private function buildHtml(): string
    {
        $name = e($this->toName);
        $email = e($this->toEmail);
        $loginUrl = rtrim(config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:5173')), '/');

        return <<<HTML
<div style="font-family: Tahoma, sans-serif; direction: rtl; text-align: right; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #eee; border-radius: 12px;">
  <h2 style="color: #6C4CF1;">خوش آمدی به Taskline</h2>
  <p>سلام {$name}،</p>
  <p>ثبت‌نامت با ایمیل <strong>{$email}</strong> با موفقیت انجام شد. حالا می‌تونی وارد فضای کاری بشی و اولین پروژه‌ات رو بسازی.</p>
  <p>
    <a href="{$loginUrl}" style="display:inline-block; background:#6C4CF1; color:#fff; text-decoration:none; padding:10px 18px; border-radius:8px;">
      ورود به Taskline
    </a>
  </p>
  <p style="color:#888; font-size:12px;">اگر این ثبت‌نام را تو انجام نداده‌ای، این ایمیل را نادیده بگیر.</p>
</div>
HTML;
    }
}
