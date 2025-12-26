export type Course = {
    id: string; // uuid
    slug: string;
    title: string;
    description: string | null;
    created_at: string;
};

export type CourseInsert = Omit<Course, 'id' | 'created_at'> & {
    id?: string;
    created_at?: string;
};

export type CourseUpdate = Partial<CourseInsert>;
