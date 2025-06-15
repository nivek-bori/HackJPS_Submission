import { NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

import { GoogleGenAI } from "@google/genai";

/*
	Body Parameters: {
		prompt
	}
	Context Parameters: null

	Response body: {
		success: boolean,
		error?: string,
		colors?: string,
	}
*/

export async function POST(request: Request) {
	// Authentication
	const supabase = await createClient();

	const body = await request.json();
	const prompt = body.prompt;

	if (!prompt) {
		return NextResponse.json({ success: false, error: 'Not all fields provided: email, password' }, { status: 400 });
	}
	if (typeof prompt !== 'string') {
		return NextResponse.json({ success: false, error: 'Not all fields in correct data type' }, { status: 400 });
	}

	const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

	const response = (await ai.models.generateContent({
		model: 'gemini-2.0-flash',
		contents: prompt,
	})).candidates;

	if (response) {
		const data = response[0].content?.parts;
		
		if (data && data[0]?.text) {
			const jsonMatch = data[0].text.match(/\{[^}]*"colors"\s*:\s*\[[^\]]*\][^}]*\}/);
		
			if (jsonMatch) {
				for (const json of jsonMatch) {
					const colors = JSON.parse(json).colors;
	
					console.log('PReparsed', colors);
	
					if (colors.length > 0) {
						console.log('Parsed', colors);
						return NextResponse.json({ success: true, colors: colors}, { status: 200 });
					}
				}
			}
		}
	}


	return NextResponse.json({ success: false, error: 'Failed to generate colors' }, { status: 500 });
}
