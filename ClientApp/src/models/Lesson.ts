import User from "./User";

import LessonType from "./LessonType";

export interface LessonInstance {
    Id: string;
    Name: string;
    Description: string;
    LessonType: LessonType;
    StartDate: number;
    EndDate: number;
    MeetingUri: string;
    Teachers: User[];
}

export default LessonInstance;