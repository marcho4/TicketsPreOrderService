import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: { ticket_id: string } }
) {
  try {
    const ticket_id = params.ticket_id;
    const body = await request.json();
    
    if (!body.user_id || !body.match_id) {
      return NextResponse.json(
        { error: 'Не указан ID пользователя или матча' },
        { status: 400 }
      );
    }
    
    // Делаем запрос к микросервису для отмены билета
    const backendResponse = await fetch(`http://localhost:8006/ticket/${ticket_id}/cancel`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ticket_id: ticket_id,
        user_id: body.user_id,
        match_id: body.match_id
      }),
    });
    
    // Просто возвращаем статус, так как API не возвращает никакого тела ответа
    if (!backendResponse.ok) {
      return NextResponse.json(
        { error: 'Произошла ошибка при отмене билета' },
        { status: backendResponse.status }
      );
    }
    
    return NextResponse.json(
      { msg: 'Билет успешно отменен' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Ошибка при отмене билета:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
} 