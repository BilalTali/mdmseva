<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * BillItem Model
 * 
 * Represents individual line items in a bill
 * Each item has amount, rate, and calculated quantity
 * 
 * @property int $id
 * @property int $bill_id
 * @property string $item_name
 * @property float $amount
 * @property float $rate_per_unit
 * @property float $quantity
 * @property string $unit
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
class BillItem extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'bill_id',
        'item_name',
        'amount',
        'rate_per_unit',
        'quantity',
        'unit',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'bill_id' => 'integer',
        'amount' => 'decimal:2',
        'rate_per_unit' => 'decimal:2',
        'quantity' => 'decimal:2',
    ];

    // =========================================================================
    // RELATIONSHIPS
    // =========================================================================

    /**
     * Get the bill this item belongs to
     */
    public function bill(): BelongsTo
    {
        return $this->belongsTo(Bill::class);
    }

    // =========================================================================
    // QUERY SCOPES
    // =========================================================================

    /**
     * Scope: filter by bill
     */
    public function scopeForBill($query, int $billId)
    {
        return $query->where('bill_id', $billId);
    }

    /**
     * Scope: filter by item name
     */
    public function scopeOfItem($query, string $itemName)
    {
        return $query->where('item_name', 'like', "%{$itemName}%");
    }

    /**
     * Scope: order by item name
     */
    public function scopeOrderedByName($query)
    {
        return $query->orderBy('item_name');
    }

    // =========================================================================
    // ACCESSORS & MUTATORS
    // =========================================================================

    /**
     * Get formatted amount
     */
    public function getFormattedAmount(): string
    {
        return '₹ ' . number_format($this->amount, 2);
    }

    /**
     * Get formatted rate
     */
    public function getFormattedRate(): string
    {
        return '₹ ' . number_format($this->rate_per_unit, 2) . '/' . $this->unit;
    }

    /**
     * Get formatted quantity
     */
    public function getFormattedQuantity(): string
    {
        return number_format($this->quantity, 2) . ' ' . $this->unit;
    }

    // =========================================================================
    // HELPER METHODS
    // =========================================================================

    /**
     * Calculate quantity from amount and rate
     * Quantity = Amount ÷ Rate
     */
    public static function calculateQuantity(float $amount, float $rate): float
    {
        if ($rate <= 0) {
            return 0;
        }
        
        return round($amount / $rate, 2);
    }

    /**
     * Calculate amount from quantity and rate
     * Amount = Quantity × Rate
     */
    public static function calculateAmount(float $quantity, float $rate): float
    {
        return round($quantity * $rate, 2);
    }

    /**
     * Verify calculation accuracy
     * Check if quantity × rate ≈ amount (within ₹0.01 tolerance)
     */
    public function isCalculationAccurate(): bool
    {
        $calculatedAmount = $this->quantity * $this->rate_per_unit;
        $difference = abs($calculatedAmount - $this->amount);
        
        return $difference <= 0.01; // Allow 1 paisa tolerance
    }

    /**
     * Get item summary for display
     */
    public function getSummary(): array
    {
        return [
            'id' => $this->id,
            'item_name' => $this->item_name,
            'amount' => (float) $this->amount,
            'rate_per_unit' => (float) $this->rate_per_unit,
            'quantity' => (float) $this->quantity,
            'unit' => $this->unit,
            'formatted_amount' => $this->getFormattedAmount(),
            'formatted_rate' => $this->getFormattedRate(),
            'formatted_quantity' => $this->getFormattedQuantity(),
        ];
    }

    // =========================================================================
    // VALIDATION HELPERS
    // =========================================================================

    /**
     * Get validation rules for bill items
     */
    public static function getValidationRules(): array
    {
        return [
            'item_name' => ['required', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'min:0'],
            'rate_per_unit' => ['required', 'numeric', 'min:0.01'],
            'quantity' => ['required', 'numeric', 'min:0'],
            'unit' => ['required', 'string', 'max:20'],
        ];
    }

    /**
     * Common units for validation
     */
    public static function getCommonUnits(): array
    {
        return [
            'kg' => 'Kilogram',
            'litre' => 'Litre',
            'quintal' => 'Quintal',
            'gram' => 'Gram',
            'piece' => 'Piece',
            'packet' => 'Packet',
            'bundle' => 'Bundle',
        ];
    }
}