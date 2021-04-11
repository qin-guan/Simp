import * as React from "react";
import { useEffect, useState } from "react";

import { useParams } from "react-router";
import { Flex } from "@chakra-ui/react";

import ClassroomInstance from "../../models/Classroom";
import LessonInstance from "../../models/Lesson";
import Status from "../../models/Status";

import classroomsApi from "../../api/http/Classroom";
import lessonsApi from "../../api/http/Lesson";

import AppNavBar from "../../components/app/AppNavBar";
import LessonType from "../../models/LessonType";

const Lesson = (): React.ReactElement => {
    const { classroomId, lessonId } = useParams<{ classroomId: string, lessonId: string }>();

    const [classroom, setClassroom] = useState<ClassroomInstance>({ Id: "", Name: "" });
    const [lesson, setLesson] = useState<LessonInstance>({
        Id: "",
        Name: "",
        Description: "",
        LessonType: LessonType.InPerson,
        StartDate: 0,
        EndDate: 0,
        MeetingUri: "",
        Teachers: []
    });
    
    const [status, setStatus] = useState(Status.Loading);

    useEffect(() => {
        const findClassroom = async () => {
            try {
                const classroom = await classroomsApi.find(classroomId);
                setClassroom(classroom);
            } catch {
                setStatus(Status.Error);
            }
        };
        const findLesson = async () => {
            try {
                const lesson = await lessonsApi.find(classroomId, lessonId);
                setLesson(lesson);
            } catch {
                setStatus(Status.Error);
            }
        };

        findClassroom();
        findLesson();
    }, []);


    return (
        <Flex w={"full"} h={"full"} direction={"column"}>
            <AppNavBar breadcrumbs={[{ name: classroom.Name, path: `/app/classrooms/${classroomId}` }, { name: lesson.Name, path: "#" }]}/>
            Nothing here yet, oops D:
        </Flex>
    );
};

export default Lesson;