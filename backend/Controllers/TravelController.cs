using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TravelManagementAPI.Data;
using TravelManagementAPI.DTOs;
using TravelManagementAPI.Models;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.Json;

namespace TravelManagementAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TravelController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _environment;
        private readonly string _uploadsFolder;

        public TravelController(AppDbContext context, IWebHostEnvironment environment)
        {
            _context = context;
            _environment = environment;
            _uploadsFolder = Path.Combine(_environment.ContentRootPath, "wwwroot", "uploads");
            if (!Directory.Exists(_uploadsFolder))
            {
                Directory.CreateDirectory(_uploadsFolder);
            }
        }

        private string GetUserName() => User.FindFirst("name")?.Value ?? "Unknown";

        [HttpPost("request")]
        public async Task<IActionResult> CreateTravelRequest([FromForm] TravelRequestDto request)
        {
            var userIdClaim = User.FindFirst("sub")?.Value
                ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }

            var travelRequest = new TravelRequest
            {
                UserId = userId,
                FromLocation = request.FromLocation,
                ToLocation = request.ToLocation,
                TravelDate = request.TravelDate,
                ReturnDate = request.ReturnDate,
                Purpose = request.Purpose,
                Transportation = request.Transportation,
                Accommodation = request.Accommodation,
                RequestedBudget = request.RequestedBudget,
                MiscExpenses = request.MiscExpenses,
                Status = "Pending Manager Approval"
            };

            travelRequest.Logs.Add(new RequestLog
            {
                Action = "Created",
                PerformedBy = GetUserName()
            });

            _context.TravelRequests.Add(travelRequest);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Travel request created successfully", id = travelRequest.Id });
        }

        [HttpGet("all")]
        public IActionResult GetAllTravelRequests()
        {
            var userRole = User.FindFirst("role")?.Value
                ?? User.FindFirst(ClaimTypes.Role)?.Value;
            var userIdClaim = User.FindFirst("sub")?.Value
                ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }

            IQueryable<TravelRequest> query = _context.TravelRequests
                .Include(t => t.User)
                .Include(t => t.Expenses)
                .Include(t => t.Bills)
                .Include(t => t.Logs);

            if (userRole != "Admin" && userRole != "Manager" && userRole != "Finance")
            {
                query = query.Where(t => t.UserId == userId);
            }

            var requests = query.OrderByDescending(t => t.CreatedAt).Select(t => MapToDto(t)).ToList();

            return Ok(requests);
        }

        [HttpGet("my-requests")]
        public IActionResult GetMyRequests()
        {
            var userIdClaim = User.FindFirst("sub")?.Value
                ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }

            var requests = _context.TravelRequests
                .Include(t => t.User)
                .Include(t => t.Expenses)
                .Include(t => t.Bills)
                .Include(t => t.Logs)
                .Where(t => t.UserId == userId)
                .OrderByDescending(t => t.CreatedAt)
                .Select(t => MapToDto(t))
                .ToList();

            return Ok(requests);
        }

        [HttpPut("approve/{id}")]
        public async Task<IActionResult> ApproveTravelRequest(int id, [FromBody] ApproveRequestDto request)
        {
            var userRole = User.FindFirst("role")?.Value
                ?? User.FindFirst(ClaimTypes.Role)?.Value;

            if (userRole != "Admin" && userRole != "Manager")
            {
                return Forbid();
            }

            var travelRequest = await _context.TravelRequests.FirstOrDefaultAsync(t => t.Id == id);

            if (travelRequest == null) return NotFound();

            travelRequest.Status = "Pending Finance Approval";
            travelRequest.ApprovedBudget = request.ApprovedBudget ?? travelRequest.RequestedBudget;
            travelRequest.ApprovedBy = GetUserName();
            travelRequest.ManagerRemarks = request.Remarks;

            travelRequest.Logs.Add(new RequestLog
            {
                Action = "Approved",
                PerformedBy = GetUserName()
            });

            _context.TravelRequests.Update(travelRequest);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Travel request approved" });
        }

        [HttpPut("reject/{id}")]
        public async Task<IActionResult> RejectTravelRequest(int id, [FromBody] RejectRequestDto? request)
        {
            var userRole = User.FindFirst("role")?.Value
                ?? User.FindFirst(ClaimTypes.Role)?.Value;

            if (userRole != "Admin" && userRole != "Manager")
            {
                return Forbid();
            }

            var travelRequest = await _context.TravelRequests.FirstOrDefaultAsync(t => t.Id == id);

            if (travelRequest == null) return NotFound();

            travelRequest.Status = "Rejected by Manager";
            travelRequest.ManagerRemarks = request?.Remarks;
            travelRequest.Logs.Add(new RequestLog
            {
                Action = "Rejected",
                PerformedBy = GetUserName()
            });

            _context.TravelRequests.Update(travelRequest);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Travel request rejected" });
        }

        [HttpPut("finance-approve/{id}")]
        public async Task<IActionResult> FinanceApprove(int id, [FromBody] ApproveRequestDto request)
        {
            var userRole = User.FindFirst("role")?.Value
                ?? User.FindFirst(ClaimTypes.Role)?.Value;

            if (userRole != "Admin" && userRole != "Finance")
            {
                return Forbid();
            }

            var travelRequest = await _context.TravelRequests.FirstOrDefaultAsync(t => t.Id == id);
            if (travelRequest == null) return NotFound();

            travelRequest.Status = "Finance Approved";
            travelRequest.FinanceRemarks = request.Remarks;
            travelRequest.Logs.Add(new RequestLog
            {
                Action = "Finance Approved",
                PerformedBy = GetUserName()
            });

            _context.TravelRequests.Update(travelRequest);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Travel request approved by Finance" });
        }

        [HttpPut("finance-reject/{id}")]
        public async Task<IActionResult> FinanceReject(int id, [FromBody] RejectRequestDto request)
        {
            var userRole = User.FindFirst("role")?.Value
                ?? User.FindFirst(ClaimTypes.Role)?.Value;

            if (userRole != "Admin" && userRole != "Finance")
            {
                return Forbid();
            }

            var travelRequest = await _context.TravelRequests.FirstOrDefaultAsync(t => t.Id == id);
            if (travelRequest == null) return NotFound();

            // Return to Manager for review
            travelRequest.Status = "Rejected by Finance";
            travelRequest.FinanceRemarks = request.Remarks;
            travelRequest.Logs.Add(new RequestLog
            {
                Action = "Rejected by Finance",
                PerformedBy = GetUserName()
            });

            _context.TravelRequests.Update(travelRequest);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Travel request rejected by Finance and returned to Manager" });
        }

        [HttpPut("submit-report/{id}")]
        public async Task<IActionResult> SubmitReport(int id, [FromForm] string reportJson, [FromForm] string expensesJson, [FromForm] List<IFormFile> receipts)
        {
            var travelRequest = await _context.TravelRequests
                .Include(t => t.Expenses)
                .Include(t => t.Bills)
                .Include(t => t.Logs)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (travelRequest == null) return NotFound();

            // 1. Process Report
            if (!string.IsNullOrEmpty(reportJson))
            {
                var report = JsonSerializer.Deserialize<SubmitReportDto>(reportJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                if (report != null)
                {
                    travelRequest.TripTitle = report.TripTitle;
                    travelRequest.WorkCompleted = report.WorkCompleted;
                    travelRequest.MeetingDetails = report.MeetingDetails;
                    travelRequest.TravelSummary = report.TravelSummary;
                    travelRequest.IssuesFaced = report.IssuesFaced;
                    travelRequest.FinalOutcome = report.FinalOutcome;
                    travelRequest.ReportSubmittedAt = DateTime.UtcNow;
                }
            }

            // 2. Process Expenses
            if (!string.IsNullOrEmpty(expensesJson))
            {
                var expenseDtos = JsonSerializer.Deserialize<List<ExpenseDto>>(expensesJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                if (expenseDtos != null)
                {
                    foreach (var exp in expenseDtos)
                    {
                        travelRequest.Expenses.Add(new Expense
                        {
                            Title = exp.Title,
                            Type = exp.Type,
                            ActualAmount = exp.ActualAmount,
                            Date = exp.Date,
                            Notes = exp.Notes
                        });
                    }
                }
            }

            // 3. Process Bills
            if (receipts != null && receipts.Count > 0)
            {
                foreach (var receipt in receipts)
                {
                    var fileName = Guid.NewGuid().ToString() + Path.GetExtension(receipt.FileName);
                    var filePath = Path.Combine(_uploadsFolder, fileName);
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await receipt.CopyToAsync(stream);
                    }
                    travelRequest.Bills.Add(new Bill
                    {
                        FilePath = "/uploads/" + fileName
                    });
                }
            }

            travelRequest.Status = "Expense Submitted";
            travelRequest.Logs.Add(new RequestLog
            {
                Action = "ReportSubmitted",
                PerformedBy = GetUserName()
            });

            _context.TravelRequests.Update(travelRequest);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Travel report and expenses submitted successfully" });
        }

        [HttpPut("validate-bill/{id}")]
        public async Task<IActionResult> ValidateBill(int id, [FromBody] bool isValid)
        {
            var userRole = User.FindFirst("role")?.Value
                ?? User.FindFirst(ClaimTypes.Role)?.Value;

            if (userRole != "Admin" && userRole != "Finance")
            {
                return Forbid();
            }

            var travelRequest = await _context.TravelRequests.FindAsync(id);
            if (travelRequest == null) return NotFound();

            travelRequest.Status = isValid ? "Reimbursement Approved" : "Rejected by Finance";
            travelRequest.Logs.Add(new RequestLog
            {
                Action = isValid ? "Reimbursement Approved" : "Rejected by Finance",
                PerformedBy = GetUserName()
            });

            _context.TravelRequests.Update(travelRequest);
            await _context.SaveChangesAsync();

            return Ok(new { message = isValid ? "Report validated and reimbursed" : "Expenses rejected" });
        }

        [HttpGet("stats")]
        public IActionResult GetTravelStats()
        {
            var userRole = User.FindFirst("role")?.Value
                ?? User.FindFirst(ClaimTypes.Role)?.Value;

            if (userRole != "Admin" && userRole != "Manager" && userRole != "Finance")
            {
                return Forbid();
            }

            var stats = new
            {
                Total = _context.TravelRequests.Count(),
                PendingManager = _context.TravelRequests.Count(t => t.Status == "Pending Manager Approval"),
                PendingFinance = _context.TravelRequests.Count(t => t.Status == "Pending Finance Approval"),
                FinanceApproved = _context.TravelRequests.Count(t => t.Status == "Finance Approved"),
                Rejected = _context.TravelRequests.Count(t => t.Status.Contains("Rejected")),
                ExpenseSubmitted = _context.TravelRequests.Count(t => t.Status == "Expense Submitted"),
                Reimbursed = _context.TravelRequests.Count(t => t.Status == "Reimbursement Approved"),
                TotalBudgetRequested = _context.TravelRequests.Sum(t => t.RequestedBudget),
                TotalBudgetApproved = _context.TravelRequests.Where(t => t.ApprovedBudget != null).Sum(t => t.ApprovedBudget) ?? 0,
                TotalActualExpense = _context.Expenses.Sum(e => e.ActualAmount)
            };

            return Ok(stats);
        }

        private static TravelRequestDto MapToDto(TravelRequest t)
        {
            return new TravelRequestDto
            {
                Id = t.Id,
                UserId = t.UserId,
                UserName = t.User?.Name ?? "",
                EmployeeId = t.User?.EmployeeId ?? "",
                Email = t.User?.Email ?? "",
                PhoneNumber = t.User?.PhoneNumber ?? "",
                Department = t.User?.Department ?? "",
                FromLocation = t.FromLocation,
                ToLocation = t.ToLocation,
                TravelDate = t.TravelDate,
                ReturnDate = t.ReturnDate,
                Purpose = t.Purpose,
                Transportation = t.Transportation ?? "",
                Accommodation = t.Accommodation ?? "",
                MiscExpenses = t.MiscExpenses,
                ManagerRemarks = t.ManagerRemarks ?? "",
                FinanceRemarks = t.FinanceRemarks ?? "",
                Status = t.Status,
                RequestedBudget = t.RequestedBudget,
                ApprovedBudget = t.ApprovedBudget,
                ApprovedBy = t.ApprovedBy,
                CreatedAt = t.CreatedAt,
                
                TripTitle = t.TripTitle,
                WorkCompleted = t.WorkCompleted,
                MeetingDetails = t.MeetingDetails,
                TravelSummary = t.TravelSummary,
                IssuesFaced = t.IssuesFaced,
                FinalOutcome = t.FinalOutcome,
                ReportSubmittedAt = t.ReportSubmittedAt,

                ActualExpense = t.Expenses?.Sum(e => e.ActualAmount) ?? 0,
                Expenses = t.Expenses?.Select(e => new ExpenseDto { 
                    Id = e.Id, 
                    Title = e.Title,
                    Type = e.Type, 
                    EstimatedAmount = e.EstimatedAmount,
                    ActualAmount = e.ActualAmount,
                    Date = e.Date,
                    Notes = e.Notes
                }).ToList() ?? new List<ExpenseDto>(),
                Bills = t.Bills?.Select(b => new BillDto { Id = b.Id, FilePath = b.FilePath, UploadDate = b.UploadDate }).ToList() ?? new List<BillDto>(),
                Logs = t.Logs?.Select(l => new RequestLogDto { Id = l.Id, Action = l.Action, PerformedBy = l.PerformedBy, Timestamp = l.Timestamp }).ToList() ?? new List<RequestLogDto>()
            };
        }
    }
}
