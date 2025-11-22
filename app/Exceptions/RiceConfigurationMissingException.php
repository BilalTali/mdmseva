<?php

namespace App\Exceptions;

use Exception;

/**
 * Exception thrown when rice configuration is missing for a user
 * 
 * This exception is thrown when attempting to generate a rice report
 * or perform calculations for a user who doesn't have their rice
 * configuration (rice_per_student, rice_per_cook) set up in the
 * rice_configurations table.
 * 
 * Location: app/Exceptions/RiceConfigurationMissingException.php
 * 
 * @package App\Exceptions
 */
class RiceConfigurationMissingException extends Exception
{
    /**
     * The user ID that's missing configuration
     * 
     * @var int|null
     */
    protected ?int $userId = null;

    /**
     * Constructor
     * 
     * @param string $message The exception message
     * @param int|null $userId The ID of the user missing configuration
     * @param int $code The exception code (default: 424)
     * @param Exception|null $previous Previous exception for chaining
     */
    public function __construct(
        string $message = "Rice configuration is missing. Please set up rice consumption rates before generating reports.",
        ?int $userId = null,
        int $code = 424,
        ?Exception $previous = null
    ) {
        parent::__construct($message, $code, $previous);
        $this->userId = $userId;
    }

    /**
     * Get the user ID
     * 
     * @return int|null
     */
    public function getUserId(): ?int
    {
        return $this->userId;
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
                'error' => 'Rice Configuration Missing',
                'message' => $this->getMessage(),
            ];

            if ($this->userId) {
                $response['user_id'] = $this->userId;
            }

            return response()->json($response, $this->getCode());
        }

        // Redirect to rice configuration setup page
        return redirect()->route('rice-config.edit')
            ->with('error', $this->getMessage());
    }
}