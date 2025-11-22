<?php
namespace App\Exceptions;
use Exception;
/**
 * Exception thrown when attempting to create a duplicate report
 * 
 * This exception is thrown when trying to generate a rice report
 * for a month/year that already has a report. Use regenerateReport()
 * method instead if you need to update an existing report.
 * 
 * Location: app/Exceptions/ReportAlreadyExistsException.php
 * 
 * @package App\Exceptions
 */
class ReportAlreadyExistsException extends Exception
{
    /**
     * The existing report ID
     * 
     * @var int|null
     */
    protected ?int $reportId = null;
    /**
     * Constructor
     * 
     * @param string $message The exception message
     * @param int|null $reportId The ID of the existing report
     * @param int $code The exception code (default: 409)
     * @param Exception|null $previous Previous exception for chaining
     */
    public function __construct(
        string $message = "A report already exists for this period. Use regenerateReport() to update it.",
        ?int $reportId = null,
        int $code = 409,
        ?Exception $previous = null
    ) {
        parent::__construct($message, $code, $previous);
        $this->reportId = $reportId;
    }
    /**
     * Get the existing report ID
     * 
     * @return int|null
     */
    public function getReportId(): ?int
    {
        return $this->reportId;
    }
    /**
     * Render the exception as an HTTP response
     * 
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
     */
    public function render($request)
    {
        if ($request->expectsJson()) {
            $response = [
                'error' => 'Report Already Exists',
                'message' => $this->getMessage(),
            ];
            if ($this->reportId) {
                $response['existing_report_id'] = $this->reportId;
            }
            return response()->json($response, $this->getCode());
        }
        $message = $this->getMessage();
        
        if ($this->reportId) {
            return redirect()->route('rice-reports.show', $this->reportId)
                ->with('info', $message);
        }
        return redirect()->back()->with('info', $message);
    }
}