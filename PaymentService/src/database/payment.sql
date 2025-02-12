CREATE TYPE Currency AS ENUM ('USD', 'EUR', 'RUB', 'UAH');

CREATE TYPE OperationStatus AS ENUM ('pending', 'success', 'failed');

CREATE TABLE Providers (
   provider_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
   provider_name VARCHAR(255) NOT NULL,
   provider_description TEXT,
   created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
   updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Payments (
    payment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    currency Currency NOT NULL DEFAULT 'RUB',
    status OperationStatus NOT NULL DEFAULT 'pending',
    provider_id UUID NOT NULL REFERENCES Providers(provider_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
)

CREATE TABLE IF NOT EXISTS Refunds (
    refund_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID NOT NULL REFERENCES Payments(payment_id),
    status OperationStatus NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
)

CREATE TABLE IF NOT EXISTS PaymentLogs (
    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID NOT NULL REFERENCES Payments(payment_id),
    refund_id UUID REFERENCES Refunds(refund_id),
    log_message TEXT NOT NULL,
    log_status OperationStatus NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
)