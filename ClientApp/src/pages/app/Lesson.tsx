import * as React from "react";
import { useEffect, useMemo, useState } from "react";

import { useParams } from "react-router";
import {
    Box,
    Spacer,
    Button,
    Flex,
    Heading,
    Spinner,
    Wrap,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    Avatar
} from "@chakra-ui/react";

import ClassroomInstance from "../../models/Classroom";
import LessonInstance from "../../models/Lesson";
import Status from "../../models/Status";

import classroomsApi from "../../api/http/Classroom";
import lessonsApi from "../../api/http/Lesson";

import AppNavBar from "../../components/app/AppNavBar";
import LessonType from "../../models/LessonType";
import AttendanceCodeModal from "../../components/app/AttendanceCodeModal";
import authorizationService from "../../oidc/AuthorizationService";

const Lesson = (): React.ReactElement => {
    const { classroomId, lessonId } = useParams<{ classroomId: string, lessonId: string }>();

    const [isTeacher, setIsTeacher] = useState(false);
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
    const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const classroom = await classroomsApi.find(classroomId);
                setClassroom(classroom);

                const lesson = await lessonsApi.find(classroomId, lessonId);
                const profile = await authorizationService.getUserProfile();
                if (lesson.Teachers.filter(t => t.Id === profile.sub).length > 0) setIsTeacher(true);

                setLesson(lesson);
                setStatus(Status.Done);
            } catch {
                setStatus(Status.Error);
            }
        };

        fetchData();
    }, [classroomId, lessonId]);

    const navigateToMeeting = () => window.location.href = lesson.MeetingUri;
    const openAttendanceModal = () => setAttendanceModalOpen(true);
    const onAttendanceModalClose = () => setAttendanceModalOpen(false);

    return (
        <Flex w={"full"} h={"full"} direction={"column"}>
            {attendanceModalOpen && <AttendanceCodeModal
                lesson={lesson}
                classroom={classroom}

                isOpen={attendanceModalOpen}
                onClose={onAttendanceModalClose}
            />}
            <AppNavBar breadcrumbs={[{ name: classroom.Name, path: `/app/classrooms/${classroomId}` }, {
                name: lesson.Name,
                path: "#"
            }]}/>
            <Flex justifyContent={"center"} p={4} style={{ flex: 1 }}>
                {{
                    [Status.Loading]: <Spinner alignSelf={"center"}/>,
                    [Status.Empty]: (
                        <Flex direction={"column"} alignItems={"center"} alignSelf={"center"}>
                            <Heading size={"lg"}>This error was not supposed to happen</Heading>
                        </Flex>
                    ),
                    [Status.Error]: <Heading size={"lg"} alignSelf={"center"}>An unknown error occurred</Heading>,
                    [Status.Done]: (
                        <Flex style={{ flex: 1 }} direction={"column"}>
                            <Flex justifyContent={"space-between"}>
                                {isTeacher && (
                                    <Box borderWidth={1} borderRadius={"lg"} p={4}>
                                        <Flex>
                                            <Heading size={"lg"}>Attendance</Heading>
                                            <Button ml={16} colorScheme={"blue"} onClick={openAttendanceModal}>Show
                                                attendance code</Button>
                                        </Flex>
                                    </Box>
                                )}
                                <Spacer/>
                                <Button onClick={navigateToMeeting} colorScheme={"teal"} size={"lg"}>
                                    Go to meeting
                                </Button>
                            </Flex>
                            <Spacer/>
                            <Box>
                                <Heading size={"md"}>Teachers</Heading>
                                <Wrap mt={3}>
                                    {lesson.Teachers.map(teacher => (
                                        <Avatar key={teacher.Id} name={teacher.Name}/>
                                    ))}
                                </Wrap>
                            </Box>
                        </Flex>
                    )
                }[status]}
            </Flex>
        </Flex>
    );
};

export default Lesson;