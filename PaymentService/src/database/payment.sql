DROP SCHEMA IF EXISTS PaymentsSchema CASCADE;

CREATE SCHEMA IF NOT EXISTS PaymentsSchema;

CREATE TYPE PaymentsSchema.Currency AS ENUM ('USD', 'EUR', 'RUB', 'UAH');
CREATE TYPE PaymentsSchema.OperationStatus AS ENUM ('pending', 'success', 'failed', 'cancelled');

CREATE TABLE PaymentsSchema.Providers (
    provider_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_name VARCHAR(255) NOT NULL,
    provider_description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS PaymentsSchema.Payments (
    payment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    currency PaymentsSchema.Currency NOT NULL DEFAULT 'RUB',
    status PaymentsSchema.OperationStatus NOT NULL DEFAULT 'pending',
    provider_id UUID NOT NULL,
    match_id UUID NOT NULL,
    ticket_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS PaymentsSchema.Refunds (
    refund_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID NOT NULL,
    user_id UUID NOT NULL,
    status PaymentsSchema.OperationStatus NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS PaymentsSchema.PaymentLogs (
    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID NOT NULL REFERENCES PaymentsSchema.Payments(payment_id),
    refund_id UUID REFERENCES PaymentsSchema.Refunds(refund_id),
    log_message TEXT NOT NULL,
    log_status PaymentsSchema.OperationStatus NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

------------------------------------------------triggers-----------------------------------------------------------

CREATE OR REPLACE FUNCTION update_payment_and_refund_status()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE PaymentsSchema.Payments
    SET status = 'cancelled'
    WHERE payment_id = NEW.payment_id;

    UPDATE PaymentsSchema.Refunds
    SET status = 'success'
    WHERE refund_id = NEW.refund_id;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- триггер отработает каждый раз после вставки нового значения в refunds
CREATE TRIGGER update_payment_status
AFTER INSERT OR UPDATE ON PaymentsSchema.Refunds
FOR EACH ROW
EXECUTE FUNCTION update_payment_and_refund_status();

------------------------------------------------indices-----------------------------------------------------------

CREATE INDEX idx_providers_provider_name ON PaymentsSchema.Providers (provider_name);
CREATE INDEX idx_payment_user_id ON PaymentsSchema.Payments (user_id);
CREATE INDEX idx_match_id ON PaymentsSchema.Payments (match_id);
CREATE INDEX idx_refund_user_id ON PaymentsSchema.Refunds (user_id);