import { NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import prisma from '@/lib/prisma/prisma';

/* 
	Body params: {
		email: string,
		password: string,
		name: string
	}
	Context params: null

	Response body: {
		success: boolean,
		error?: string
		redirectUrl?: string	
	}
*/

export async function POST(request: Request) {
	const body = await request.json();
	const email = body.email;
	const password = body.password;
	const name = body.name;

	if (!email || !password || !name) {
		return NextResponse.json({ success: false, error: 'Not all fields provided: email, password, name' }, { status: 400 });
	}

	const supabase = await createClient();

	let auth_data_ = null;
	let user_created: boolean = false;

	try {
		// Auth sign up
		const { data: auth_data, error: auth_error } = await supabase.auth.signUp({
			email: email,
			password: password,
			options: { data: { name: name } },
		});

		// Auth errros
		if (auth_error) {
			console.log('Route: /api/signup', auth_error.code, auth_error.message);
			return NextResponse.json({ success: false, error: auth_error.message }, { status: 400 });
		}
		if (!auth_data.user) {
			console.log('Route: /api/signup', 'Error: auth_data.user is null');
			return NextResponse.json(
				{
					success: false,
					error: 'There was an issue signing up. Please try again',
				},
				{ status: 500 },
			);
		}

		auth_data_ = auth_data;

		// DB sign up
		const db_data = await prisma.users.create({
			data: {
				id: auth_data.user.id,
				email: email,
				name: name,
			},
		});

		user_created = true;
	} catch (error: any) {
		console.log('Route: /api/signup', error.code, error.message);

		if (auth_data_?.user && user_created) {
			const supabase = createAdminClient();
			await supabase.auth.admin.deleteUser(auth_data_.user.id);

			console.log('Deleted unpaired auth user');
		}

		let message = error.message;
		if (error.code === 'P2002') message = 'Email address already exists';

		return NextResponse.json({ success: false, error: message }, { status: 500 });
	}

	return NextResponse.json({ success: true, redirectUrl: '/signin' }, { status: 200 });
}
