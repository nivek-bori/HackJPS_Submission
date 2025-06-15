import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma/prisma';
import { createClient } from '@/lib/supabase/server';

// Only allow in development
const isDev = process.env.NODE_ENV === 'development';

export async function DELETE(request: Request) {
	if (!isDev) {
		console.error('Attempted to access /api/developer in non-development environment');
		return NextResponse.json(
			{
				success: false,
				error: 'This endpoint is only available in development',
			},
			{ status: 403 },
		);
	}

	const supabase = await createClient();
	const { data: auth_data, error: auth_error } = await supabase.auth.getUser();

	// Auth errros
	if (auth_error) {
		return NextResponse.json({ success: false, error: 'Please sign in' }, { status: 401 });
	}
	if (!auth_data.user) {
		return NextResponse.json(
			{
				success: false,
				error: 'Please sign in',
			},
			{ status: 401 },
		);
	}
	if (auth_data.user.role !== 'admin') {
		return NextResponse.json({ sucess: false, error: 'Unauthorized action' }, { status: 403 });
	}

	try {
		const db_data = await prisma.colorPals.deleteMany({});
	} catch (error: any) {
		console.log('Route /api/developer/colors', error.message);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}

	return NextResponse.json({ success: true }, { status: 200 });
}
