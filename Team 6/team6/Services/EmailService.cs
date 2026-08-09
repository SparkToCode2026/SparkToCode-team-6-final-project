using System;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;

namespace team6.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _config;

        public EmailService(IConfiguration config)
        {
            _config = config;
        }

        public async Task SendViewingConfirmationAsync(string toEmail, string userName, string propertyAddress, DateTime viewingDate)
        {
            var smtpHost = _config["EmailSettings:SmtpHost"];
            var smtpPort = int.Parse(_config["EmailSettings:SmtpPort"] ?? "587");
            var senderEmail = _config["EmailSettings:SenderEmail"];
            var senderPassword = _config["EmailSettings:SenderPassword"];
            var senderName = _config["EmailSettings:SenderName"] ?? "Real Estate Team";

            var subject = "Your Viewing is Confirmed!";
            var body = $@"
                <h2>Hi {userName},</h2>
                <p>Your viewing has been successfully scheduled.</p>
                <p><strong>Property:</strong> {propertyAddress}</p>
                <p><strong>Date & Time:</strong> {viewingDate:f}</p>
                <p>We look forward to seeing you there!</p>
                <p>— {senderName}</p>";

            using var message = new MailMessage
            {
                From = new MailAddress(senderEmail!, senderName),
                Subject = subject,
                Body = body,
                IsBodyHtml = true
            };
            message.To.Add(toEmail);

            using var client = new SmtpClient(smtpHost, smtpPort)
            {
                Credentials = new NetworkCredential(senderEmail, senderPassword),
                EnableSsl = true
            };

            await client.SendMailAsync(message);
        }
    }
}