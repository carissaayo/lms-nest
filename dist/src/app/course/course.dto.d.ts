import { CourseStatus } from './course.entity';
export declare enum CourseCategory {
    DEVELOPMENT = "Development",
    BUSINESS = "Business",
    FINANCE_ACCOUNTING = "Finance & Accounting",
    IT_SOFTWARE = "IT & Software",
    OFFICE_PRODUCTIVITY = "Office Productivity",
    PERSONAL_DEVELOPMENT = "Personal Development",
    DESIGN = "Design",
    MARKETING = "Marketing",
    LIFESTYLE = "Lifestyle",
    PHOTOGRAPHY_VIDEO = "Photography & Video",
    HEALTH_FITNESS = "Health & Fitness",
    MUSIC = "Music",
    TEACHING_ACADEMICS = "Teaching & Academics"
}
export declare class CreateCourseDTO {
    title: string;
    description: string;
    category: string;
    price: number;
}
export declare class UpdateCourseDTO {
    title?: string;
    description?: string;
    category?: string;
    price?: number;
}
export declare class AdminCourseActionDTO {
    action: CourseStatus;
    rejectReason?: string;
    suspendReason?: string;
}
