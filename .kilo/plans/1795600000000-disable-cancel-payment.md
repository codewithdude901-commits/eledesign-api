# Plan: Disable cancel payment button during payment processing

## Problem
The "Cancel payment" button in `CheckoutPage.tsx` (line 424-430) remains enabled while payment is being processed (`isProcessingPayment === true`). Clicking it during processing resets `paymentData` to `null`, aborting the in-flight payment and potentially leaving the payment in an inconsistent state.

## Solution
Disable the "Cancel payment" button when `isProcessingPayment` is true. Use the `disabled` prop on the Button component.

## Files to edit
- `src/components/checkout/CheckoutPage.tsx` — add `disabled={isProcessingPayment}` to the cancel payment Button (line 424).

## Validation
- Manual: Start checkout → click "Buy now" → cancel button should be disabled during processing
- Manual: After payment completes or fails → cancel button re-enabled (or form resets)