export type Body = {
	id: string;

	isDragging: boolean;

	radius: number;
	x: number;
	y: number;
	vx: number;
	vy: number;

	mass: number;

	deformX: number;
	deformY: number;
	targetDeformX: number;
	targetDeformY: number;

	colorHEX: string;
	colorHSL: string;
};

export type Point = {
	x: number;
	y: number;
	c: number[];
	pert: number[];
};

export type Color = {
	id: string;
	colors: string[];
};
