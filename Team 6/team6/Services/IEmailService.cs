using System;
using System.Threading.Tasks;

namespace team6.Services
{
    public interface IEmailService
    {
        // Trigger #1 (Dev 3): sent when a buyer books a viewing
        Task SendViewingConfirmationAsync(string toEmail, string userName, string propertyAddress, DateTime viewingDate);
        
        // Trigger #2 (Dev 5): sent when a contract's status changes to "Signed"
        Task SendContractSignedNotificationAsync(string toEmail, string userName, int contractId, DateTime signedDate);
    }
}