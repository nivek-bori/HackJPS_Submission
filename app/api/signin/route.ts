import { NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

/*
	Body Parameters: {
		email: string,
		password: string
	}
	Context Parameters: null

	Response body: {
		success: boolean,
		error?: string,
		redirectUrl?: string,
	}
*/

export async function POST(request: Request) {
	// Authentication
	const supabase = await createClient();

	const body = await request.json();
	const email = body.email;
	const password = body.password;

	if (!email || !password) {
		return NextResponse.json({ success: false, error: 'Not all fields provided: email, password' }, { status: 400 });
	}
	if (typeof email !== 'string' || typeof password !== 'string') {
		return NextResponse.json({ success: false, error: 'Not all fields in correct data type' }, { status: 400 });
	}

	const { data: auth_data, error: auth_error } = await supabase.auth.signInWithPassword({
		email: email,
		password: password,
	});

	// Auth errors
	if (auth_error) {
		if ((auth_error.code = 'email_not_confirmed')) {
			auth_error.message = 'Please confirm your email';
		}

		console.log('Route /api/signin', auth_error.message);
		return NextResponse.json({ success: false, error: auth_error.message }, { status: 400 });
	}
	if (!auth_data.user) {
		// User error - not srever erro
		return NextResponse.json({ success: false, error: 'Please confirm your email' }, { status: 202 });
	}

	return NextResponse.json({ success: true, redirectUrl: '/' }, { status: 200 });
}
