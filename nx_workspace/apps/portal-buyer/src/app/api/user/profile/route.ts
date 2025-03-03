import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/auth-options';
import { Session } from 'next-auth';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse(
      JSON.stringify({ error: 'Authentication required' }),
      { status: 401 }
    );
  }

  try {
    // Replace with actual database call
    const profile = {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: session.user?.email,
      company: 'Acme Corp',
      phone: '+1234567890',
      address: '123 Business St',
      city: 'New York',
      country: 'USA',
    };

    return NextResponse.json(profile);
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch profile' }),
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse(
      JSON.stringify({ error: 'Authentication required' }),
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    // Update profile in database
    const updatedProfile = {
      ...body,
      id: '1',
      email: session.user?.email,
    };

    return NextResponse.json(updatedProfile);
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ error: 'Failed to update profile' }),
      { status: 500 }
    );
  }
}