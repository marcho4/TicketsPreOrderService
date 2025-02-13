DROP SCHEMA IF EXISTS PaymentsSchema CASCADE;

CREATE SCHEMA IF NOT EXISTS PaymentsSchema;

CREATE TYPE PaymentsSchema.Currency AS ENUM ('USD', 'EUR', 'RUB', 'UAH');
CREATE TYPE PaymentsSchema.OperationStatus AS ENUM ('pending', 'success', 'failed');

CREATE TABLE PaymentsSchema.Providers (
    provider_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_name VARCHAR(255) NOT NULL,
    provider_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS PaymentsSchema.Payments (
    payment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    currency PaymentsSchema.Currency NOT NULL DEFAULT 'RUB',
    status PaymentsSchema.OperationStatus NOT NULL DEFAULT 'pending',
    provider_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS PaymentsSchema.Refunds (
    refund_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID NOT NULL,
    status PaymentsSchema.OperationStatus NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS PaymentsSchema.PaymentLogs (
    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID NOT NULL REFERENCES PaymentsSchema.Payments(payment_id),
    refund_id UUID REFERENCES PaymentsSchema.Refunds(refund_id),
    log_message TEXT NOT NULL,
    log_status PaymentsSchema.OperationStatus NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);