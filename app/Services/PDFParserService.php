<?php

namespace App\Services;

use Smalot\PdfParser\Parser;
use Exception;

class PDFParserService
{
    protected $parser;

    public function __construct()
    {
        $this->parser = new Parser();
    }

    /**
     * Extract text content from a PDF file
     * 
     * @param string $filePath Full path to the PDF file
     * @return string Extracted text content
     * @throws Exception
     */
    public function parse(string $filePath): string
    {
        try {
            $pdf = $this->parser->parseFile($filePath);
            $text = $pdf->getText();

            // Clean up text
            $text = preg_replace('/\s+/', ' ', $text);
            $text = trim($text);

            return $text;
        } catch (Exception $e) {
            throw new Exception("Failed to parse PDF: " . $e->getMessage());
        }
    }

    /**
     * Validate if file is a valid PDF
     */
    public function isValidPDF(string $filePath): bool
    {
        try {
            $this->parser->parseFile($filePath);
            return true;
        } catch (Exception $e) {
            return false;
        }
    }
}
