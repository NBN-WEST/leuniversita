export type Course = {
    id: string; // uuid
    slug: string;
    title: string;
    description: string | null;
    status: 'draft' | 'published' | 'archived';
    created_at: string;
};

export type CourseInsert = Omit<Course, 'id' | 'created_at'> & {
    id?: string;
    created_at?: string;
};

export type CourseUpdate = Partial<CourseInsert>;

export type Exam = {
    id: string; // text id (e.g. diritto-privato)
    title: string;
    description: string | null;
    icon_name: string | null;
    is_active: boolean;
    created_at: string;
};

export type ExamInsert = Omit<Exam, 'created_at'> & {
    created_at?: string;
};

export type ExamUpdate = Partial<ExamInsert>;

export type Module = {
    id: string; // uuid
    course_id: string;
    slug: string;
    title: string;
    server_id: string | null;
    order_index: number;
    created_at: string;
};

export type ModuleInsert = Omit<Module, 'id' | 'created_at'> & {
    id?: string;
    created_at?: string;
};

export type ModuleUpdate = Partial<ModuleInsert>;

export type LearningPathItem = {
    id: string;
    course_id: string;
    module_id: string;
    type: 'core' | 'reinforcement';
    order_index: number;
    status: 'active' | 'archived';
    created_at: string;
    modules?: { id: string; title: string; slug: string };
    courses?: { title: string };
};

export type LearningPathItemInsert = Omit<LearningPathItem, 'id' | 'created_at' | 'modules' | 'courses'> & {
    id?: string;
    created_at?: string;
};

export type LearningPathItemUpdate = Partial<LearningPathItemInsert>;
