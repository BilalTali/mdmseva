<?php

namespace App\Exceptions;

use Exception;

/**
 * Exception thrown when no consumption records are found for a given period
 * 
 * This exception is thrown when attempting to generate a rice report
 * for a month/year that has no daily consumption records.
 * 
 * Location: app/Exceptions/NoConsumptionDataException.php
 * 
 * @package App\Exceptions
 */
class NoConsumptionDataException extends Exception
{
    /**
     * Constructor
     * 
     * @param string $message The exception message
     * @param int $code The exception code (default: 404)
     * @param Exception|null $previous Previous exception for chaining
     */
    public function __construct(
        string $message = "No consumption data found for the specified period.",
        int $code = 404,
        ?Exception $previous = null
    ) {
        parent::__construct($message, $code, $previous);
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
            return response()->json([
                'error' => 'No Consumption Data',
                'message' => $this->getMessage(),
            ], $this->getCode());
        }

        return redirect()->back()->with('error', $this->getMessage());
    }
}