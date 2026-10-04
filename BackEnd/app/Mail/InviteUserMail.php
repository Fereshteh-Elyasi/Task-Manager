<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class InviteUserMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $toName,
        public string $toEmail,
        public string $tempPassword,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'دعوت به Taskline',
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
        $pass = e($this->tempPassword);
        $loginUrl = rtrim(config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:5173')), '/');

        return <<<HTML
<div style="font-family: Tahoma, sans-serif; direction: rtl; text-align: right; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #eee; border-radius: 12px;">
  <h2 style="color: #6C4CF1;">دعوت به Taskline</h2>
  <p>سلام {$name}،</p>
  <p>یکی از اعضای تیم شما را به فضای کاری Taskline دعوت کرده. با اطلاعات زیر وارد شو:</p>
  <p style="background:#f5f3ff; padding:12px 16px; border-radius:8px; line-height:1.9;">
    <strong>ایمیل:</strong> {$email}<br>
    <strong>رمز موقت:</strong> {$pass}
  </p>
  <p>
    <a href="{$loginUrl}" style="display:inline-block; background:#6C4CF1; color:#fff; text-decoration:none; padding:10px 18px; border-radius:8px;">
      ورود به Taskline
    </a>
  </p>
  <p style="color:#888; font-size:12px;">بعد از ورود، از پروفایل رمز را عوض کن.</p>
</div>
HTML;
    }
}
