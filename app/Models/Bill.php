<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Bill Model
 * 
 * Represents vendor purchase bills for kiryana (groceries) or fuel
 * Each bill belongs to an AmountReport and contains multiple BillItems
 * 
 * @property int $id
 * @property int $amount_report_id
 * @property int $created_by
 * @property string $type (kiryana|fuel)
 * @property string $shop_name
 * @property string $shopkeeper_name
 * @property string $phone
 * @property string|null $address
 * @property float $total_amount
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
class Bill extends Model
{
    use HasFactory;

    /**
     * Bill type constants
     */
    const TYPE_KIRYANA = 'kiryana';
    const TYPE_FUEL = 'fuel';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'amount_report_id',
        'created_by',
        'type',
        'shop_name',
        'shopkeeper_name',
        'phone',
        'address',
        'total_amount',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'amount_report_id' => 'integer',
        'created_by' => 'integer',
        'total_amount' => 'decimal:2',
    ];

    // =========================================================================
    // RELATIONSHIPS
    // =========================================================================

    /**
     * Get the amount report this bill belongs to
     */
    public function report(): BelongsTo
    {
        return $this->belongsTo(AmountReport::class, 'amount_report_id');
    }

    /**
     * Get the user who created this bill
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get all line items for this bill
     */
    public function items(): HasMany
    {
        return $this->hasMany(BillItem::class);
    }

    // =========================================================================
    // QUERY SCOPES
    // =========================================================================

    /**
     * Scope: filter by bill type
     */
    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope: filter kiryana bills
     */
    public function scopeKiryana($query)
    {
        return $query->where('type', self::TYPE_KIRYANA);
    }

    /**
     * Scope: filter fuel bills
     */
    public function scopeFuel($query)
    {
        return $query->where('type', self::TYPE_FUEL);
    }

    /**
     * Scope: filter by amount report
     */
    public function scopeForReport($query, int $reportId)
    {
        return $query->where('amount_report_id', $reportId);
    }

    /**
     * Scope: order by latest first
     */
    public function scopeLatest($query)
    {
        return $query->orderBy('created_at', 'desc');
    }

    // =========================================================================
    // ACCESSORS
    // =========================================================================

    /**
     * Get formatted bill type label
     */
    public function getTypeLabel(): string
    {
        return match($this->type) {
            self::TYPE_KIRYANA => 'Kiryana (Groceries)',
            self::TYPE_FUEL => 'Fuel',
            default => ucfirst($this->type),
        };
    }

    /**
     * Get bill number (formatted ID)
     */
    public function getBillNumber(): string
    {
        return 'BILL-' . str_pad($this->id, 6, '0', STR_PAD_LEFT);
    }

    /**
     * Get formatted total amount
     */
    public function getFormattedTotal(): string
    {
        return '₹ ' . number_format($this->total_amount, 2);
    }

    // =========================================================================
    // HELPER METHODS
    // =========================================================================

    /**
     * Check if bill is kiryana type
     */
    public function isKiryana(): bool
    {
        return $this->type === self::TYPE_KIRYANA;
    }

    /**
     * Check if bill is fuel type
     */
    public function isFuel(): bool
    {
        return $this->type === self::TYPE_FUEL;
    }

    /**
     * Calculate total amount from all items
     */
    public function calculateTotal(): float
    {
        return (float) $this->items()->sum('amount');
    }

    /**
     * Get total items count
     */
    public function getItemsCount(): int
    {
        return $this->items()->count();
    }

    /**
     * Get bill summary for display
     */
    public function getSummary(): array
    {
        return [
            'id' => $this->id,
            'bill_number' => $this->getBillNumber(),
            'type' => $this->type,
            'type_label' => $this->getTypeLabel(),
            'shop_name' => $this->shop_name,
            'shopkeeper_name' => $this->shopkeeper_name,
            'phone' => $this->phone,
            'address' => $this->address,
            'total_amount' => (float) $this->total_amount,
            'formatted_total' => $this->getFormattedTotal(),
            'items_count' => $this->getItemsCount(),
            'created_at' => $this->created_at->format('M d, Y'),
            'created_at_human' => $this->created_at->diffForHumans(),
        ];
    }

    // =========================================================================
    // VALIDATION HELPERS
    // =========================================================================

    /**
     * Get validation rules for creating a bill
     */
    public static function getValidationRules(): array
    {
        return [
            'amount_report_id' => ['required', 'exists:amount_reports,id'],
            'type' => ['required', 'in:kiryana,fuel'],
            'shop_name' => ['required', 'string', 'max:255'],
            'shopkeeper_name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'digits:10'],
            'address' => ['nullable', 'string', 'max:500'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.item_name' => ['required', 'string', 'max:255'],
            'items.*.amount' => ['required', 'numeric', 'min:0'],
            'items.*.rate_per_unit' => ['required', 'numeric', 'min:0.01'],
            'items.*.quantity' => ['required', 'numeric', 'min:0'],
            'items.*.unit' => ['required', 'string', 'max:20'],
        ];
    }
}