import { NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma/prisma';

/*  GET REQUEST STRUCTURE
	Body params: {
		authentication: supabase auth
	}
	Context params: null

	Response body: {
		success: boolean,
		colors: string[][],
		error?: string
	}
*/

/*  POST REQUEST STRUCTURE
	Body params: {
		colors: Int[]
		authentication: supabase auth
	}
	Context params: null

	Response body: {
		success: boolean,
		error?: string
	}
*/

// Get User Color Pallet
export async function GET(request: Request) {
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

	try {
		const db_data = await prisma.colorPals.findMany({
			where: { user_id: auth_data.user.id },
			select: {
				id: true,
				colors: true,
			},
		});

		return NextResponse.json({ success: true, data: db_data }, { status: 200 });
	} catch (error: any) {
		console.log('Route /api/colors/get', error.message);

		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}

// Create Color Pallete
export async function POST(request: Request) {
	const supabase = await createClient();

	const { data: auth_data, error: auth_error } = await supabase.auth.getUser();

	// Auth errros
	if (auth_error) {
		return NextResponse.json({ success: false, error: 'Please sign in' }, { status: 400 });
	}
	if (!auth_data.user) {
		return NextResponse.json(
			{
				success: false,
				error: 'Please sign in',
			},
			{ status: 500 },
		);
	}

	const body = await request.json();
	let colors = body.colors;

	if (!colors || !(colors instanceof Array) || !(typeof colors[0] === 'string')) {
		return NextResponse.json({ success: false, error: 'Incorrect format: colors' }, { status: 400 });
	}

	try {
		const db_data = await prisma.colorPals.create({
			data: {
				colors: colors,
				users: {
					connect: {
						id: auth_data.user.id,
					},
				},
			},
		});
	} catch (error: any) {
		console.log('Route /api/colors/post', error.message);

		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}

	return NextResponse.json({ success: true }, { status: 200 });
}
