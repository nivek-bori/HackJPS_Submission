import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma/prisma';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

// Only allow in development
const isDev = process.env.NODE_ENV === 'development';

export async function DELETE(request: Request) {
	// TODO: ADD BACK IN
	// if (!isDev) {
	// 	console.error('Attempted to access /api/developer in non-development environment');
	// 	return NextResponse.json(
	// 		{
	// 			success: false,
	// 			error: 'This endpoint is only available in development',
	// 		},
	// 		{ status: 403 },
	// 	);
	// }

	// const supabase = await createClient();
	// const { data: auth_data, error: auth_error } = await supabase.auth.getUser();

	// // Auth errros
	// if (auth_error) {
	// 	return NextResponse.json({ success: false, error: 'Please sign in' }, { status: 401 });
	// }
	// if (!auth_data.user) {
	// 	return NextResponse.json(
	// 		{
	// 			success: false,
	// 			error: 'Please sign in',
	// 		},
	// 		{ status: 401 },
	// 	);
	// }
	// if (auth_data.user.role !== 'admin') {
	// 	return NextResponse.json({ sucess: false, error: 'Unauthorized action'}, { status: 403 });
	// }

	const body = await request.json();

	const deleteAuth = body.auth;
	const deleteDb = body.db;

	let authDeleteCount = 0;
	let dbDeleteCount = 0;

	if (deleteAuth) {
		const admin_supabase = createAdminClient();

		// Get all auth users
		const { data: admin_auth_data, error: admin_auth_error } = await admin_supabase.auth.admin.listUsers();

		if (admin_auth_error) {
			console.error('Error fetching Supabase users:', admin_auth_error);
			return NextResponse.json(
				{
					success: false,
					error: `Error fetching Supabase users: ${admin_auth_error.message}`,
				},
				{ status: 500 },
			);
		}

		// Delete each auth user
		if (admin_auth_data?.users && admin_auth_data.users.length > 0) {
			for (const user of admin_auth_data.users) {
				const { error: deleteError } = await admin_supabase.auth.admin.deleteUser(user.id);
				if (deleteError) {
					console.error(`Error deleting Supabase user ${user.id}:`, deleteError);
				} else {
					authDeleteCount++;
				}
			}
		} else {
			console.log('No Supabase auth users found to delete.');
		}
	}

	if (deleteDb) {
		// Delete all users from the database
		try {
			await prisma.colorPals.deleteMany();
			await prisma.users.deleteMany();
		} catch (dbError) {
			console.error('Error deleting users from database:', dbError);
			return NextResponse.json(
				{
					success: false,
					error: dbError instanceof Error ? dbError.message : 'Unknown DB error',
				},
				{ status: 500 },
			);
		}
	}

	console.log(`Deleted ${authDeleteCount} auth users and ${dbDeleteCount} database users.`);

	return NextResponse.json(
		{
			success: true,
			authCount: authDeleteCount,
			dbCount: dbDeleteCount,
			message: `Successfully deleted ${authDeleteCount} auth users and ${dbDeleteCount} database users`,
		},
		{ status: 200 },
	);
}
