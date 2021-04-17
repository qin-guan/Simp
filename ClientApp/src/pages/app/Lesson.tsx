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
    Text,
    Wrap,
    Avatar,
    WrapItem,
    IconButton
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
import User from "../../models/User";
import MarkAttendanceCodeModal from "../../components/app/lesson/MarkAttendanceCodeModal";

import { RepeatIcon } from "@chakra-ui/icons";
import AttendeeListModal from "../../components/app/lesson/AttendeeListModal";

const Lesson = (): React.ReactElement => {
    const { classroomId, lessonId } = useParams<{ classroomId: string, lessonId: string }>();

    const [isTeacher, setIsTeacher] = useState(false);
    const [attendees, setAttendees] = useState<User[]>([]);
    const [attendance, setAttendance] = useState(false);
    const [markAttendanceModalOpen, setMarkAttendanceModalOpen] = useState(false);
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
    const [attendeeListOpen, setAttendeeListOpen] = useState(false);

    const fetchAttendance = async () => {
        const attendance = await lessonsApi.getAttendance(classroomId, lessonId);
        setAttendance(attendance);
    };

    const fetchAttendees = async () => {
        const lessonAttendees = await lessonsApi.getAttendees(classroomId, lessonId);
        setAttendees(lessonAttendees);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const classroom = await classroomsApi.find(classroomId);
                setClassroom(classroom);

                const lesson = await lessonsApi.find(classroomId, lessonId);
                const profile = await authorizationService.getUserProfile();
                if (lesson.Teachers.filter(t => t.Id === profile.sub).length > 0) {
                    fetchAttendees();
                    setIsTeacher(true);
                }

                setLesson(lesson);
                setStatus(Status.Done);
            } catch (e) {
                console.log(e);
                setStatus(Status.Error);
            }
        };

        fetchData();
        fetchAttendance();
    }, [classroomId, lessonId]);

    const navigateToMeeting = () => window.location.href = lesson.MeetingUri;
    const openAttendanceModal = () => setAttendanceModalOpen(true);
    const onAttendanceModalClose = () => setAttendanceModalOpen(false);

    const openMarkAttendanceModal = () => setMarkAttendanceModalOpen(true);
    const onMarkAttendanceModalClose = () => setMarkAttendanceModalOpen(false);
    const onMarkedAttendance = async () => await fetchAttendance();

    const closeAttendeeList = () => setAttendeeListOpen(false);
    const openAttendeeList = () => setAttendeeListOpen(true);

    return (
        <Flex w={"full"} h={"full"} direction={"column"}>
            {attendanceModalOpen && <AttendanceCodeModal
                lesson={lesson}
                classroom={classroom}

                isOpen={attendanceModalOpen}
                onClose={onAttendanceModalClose}
            />}
            <MarkAttendanceCodeModal
                classroom={classroom}
                lesson={lesson}

                isOpen={markAttendanceModalOpen}
                onClose={onMarkAttendanceModalClose}
                onMarkedAttendance={onMarkedAttendance}
            />
            <AttendeeListModal
                attendees={attendees}
                classroom={classroom}
                lesson={lesson}

                isOpen={attendeeListOpen}
                onClose={closeAttendeeList}
                onReloadAttendance={fetchAttendance}
                onReloadAttendees={fetchAttendees}
            />
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
                        <Flex style={{ flex: 1 }}>
                            <Box>
                                <Heading>{lesson.Name}</Heading>
                                <Text>{lesson.Description}</Text>
                            </Box>
                            <Spacer/>
                            <Button onClick={navigateToMeeting} colorScheme={"teal"} size={"lg"}>
                                Go to meeting
                            </Button>
                            {!attendance && (
                                <Button onClick={openMarkAttendanceModal} colorScheme={"red"} size={"lg"} ml={3}>
                                    Mark my attendance
                                </Button>
                            )}
                        </Flex>
                    )
                }[status]}
                {isTeacher && (
                    <Box borderWidth={1} borderRadius={"lg"} p={4} ml={5}>
                        <Button colorScheme={"blue"} onClick={openAttendanceModal}>Show
                            attendance code</Button>
                        <Flex mt={3} mb={2} alignItems={"center"}>
                            <Heading size={"md"}>Attendees ({attendees.length})</Heading>
                            <Spacer/>
                            <IconButton aria-label={"Refresh"} icon={<RepeatIcon/>}
                                onClick={fetchAttendees}/>
                        </Flex>
                        <Wrap maxW={"3xs"}>
                            {attendees.length === 0 && (
                                <Text>Get your attendees to key in the attendance code and they&apos;ll show up
                                    there!</Text>
                            )}
                            {attendees.map((user, idx) => (
                                <WrapItem key={idx.toString()}>
                                    <Avatar name={user.Name}/>
                                </WrapItem>
                            ))}
                        </Wrap>
                        <Button mt={4} onClick={openAttendeeList}>View attendee list</Button>
                    </Box>
                )}
            </Flex>
        </Flex>
    );
};

export default Lesson;