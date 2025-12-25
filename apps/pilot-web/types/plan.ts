export interface PlanItem {
    id: string;
    module_id: string;
    status: 'todo' | 'done' | 'skipped' | 'locked';
    type: string;
    modules?: { title: string };
}

export interface PlanData {
    planId: string;
    level: string;
    items: PlanItem[];
}
