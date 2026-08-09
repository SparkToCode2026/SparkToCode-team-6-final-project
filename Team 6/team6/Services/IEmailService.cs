using System;
using System.Threading.Tasks;

namespace team6.Services
{
    public interface IEmailService
    {
        // Trigger #1 (Dev 3): sent when a buyer books a viewing
        Task SendViewingConfirmationAsync(string toEmail, string userName, string propertyAddress, DateTime viewingDate);
    }
}