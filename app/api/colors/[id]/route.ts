import { NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma/prisma';

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
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

	const color_pal_id = (await context.params).id;

	const db_data = await prisma?.colorPals.findUnique({
		where: {
			id: color_pal_id,
		},
		select: {
			users: true,
		},
	});

	if (!db_data) {
		return NextResponse.json({ success: false, error: "That color palette doens't exist}" }, { status: 400 });
	}

	if (auth_data.user.id !== db_data?.users.id) {
		return NextResponse.json({ success: false, error: 'You do not own this color palette' }, { status: 403 });
	}

	try {
		const db_data = await prisma.colorPals.delete({
			where: {
				id: color_pal_id,
			},
		});
	} catch (error: any) {
		console.log('Route /api/colors/[id]/delete', error.message);

		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}

	return NextResponse.json({ success: true }, { status: 200 });
}
