import * as React from "react";
import { useEffect, useState, useCallback } from "react";

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
    IconButton, Stat, StatLabel, StatNumber, StatHelpText
} from "@chakra-ui/react";
import { RepeatIcon } from "@chakra-ui/icons";

import Classroom from "../../models/Classroom";
import LessonInstance from "../../models/Lesson";
import Status from "../../models/Status";

import classroomsApi from "../../api/http/classrooms";
import lessonsApi from "../../api/http/lessons";

import AppNavBar from "../../components/app/AppNavBar";
import AttendanceCodeModal from "../../components/app/AttendanceCodeModal";
import MarkAttendanceCodeModal from "../../components/app/lesson/MarkAttendanceCodeModal";
import AttendeeListModal from "../../components/app/lesson/AttendeeListModal";

import authorizationService from "../../oidc/AuthorizationService";

import User from "../../models/User";
import LessonType from "../../models/LessonType";
import Venue from "../../models/Venue";

const Lesson = (): React.ReactElement => {
    const { classroomId, lessonId } = useParams<{ classroomId: string; lessonId: string }>();

    const [isTeacher, setIsTeacher] = useState(false);
    const [attendees, setAttendees] = useState<User[]>([]);
    const [attendance, setAttendance] = useState(false);
    const [venue, setVenue] = useState<Venue>();
    const [markAttendanceModalOpen, setMarkAttendanceModalOpen] = useState(false);
    const [classroom, setClassroom] = useState<Classroom>({ Id: "", Name: "" });
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

    const fetchAttendance = useCallback(async () => {
        try {
            const attendance = await lessonsApi.getAttendance(classroomId, lessonId);
            setAttendance(attendance);
        } catch {
            setStatus(Status.Error);
        }
    }, [classroomId, lessonId]);

    const fetchAttendees = useCallback(async () => {
        try {
            const lessonAttendees = await lessonsApi.getAttendees(classroomId, lessonId);
            setAttendees(lessonAttendees);
        } catch {
            setStatus(Status.Error);
        }
    }, [classroomId, lessonId]);

    const fetchClassroom = useCallback(async () => {
        try {
            const classroom = await classroomsApi.find(classroomId);
            setClassroom(classroom);
        } catch {
            setStatus(Status.Error);
        }
    }, [classroomId]);

    const fetchLesson = useCallback(async () => {
        try {
            const lesson = await lessonsApi.find(classroomId, lessonId);
            const profile = await authorizationService.getUserProfile();
            if (lesson.Teachers.filter(t => t.Id === profile.sub).length > 0) {
                fetchAttendees();
                setIsTeacher(true);
            }

            setLesson(lesson);
        } catch {
            setStatus(Status.Error);
        }
    }, [classroomId, lessonId]);

    const fetchVenue = useCallback(async () => {
        try {
            const venue = await lessonsApi.getVenue(classroomId, lessonId);
            if (venue && venue.Id) {
                setVenue(venue);
            }
        } catch {
            setStatus(Status.Error);
        }
    }, [classroomId, lessonId]);

    useEffect(() => {
        fetchClassroom();
        fetchLesson();
        fetchAttendance();
        fetchVenue();
        setStatus(Status.Done);
    }, [fetchClassroom, fetchLesson, fetchAttendance]);

    const navigateToMeeting = () => window.location.href = lesson.MeetingUri;
    const openAttendanceModal = () => setAttendanceModalOpen(true);
    const onAttendanceModalClosed = () => setAttendanceModalOpen(false);

    const openMarkAttendanceModal = () => setMarkAttendanceModalOpen(true);
    const onMarkAttendanceModalClosed = () => setMarkAttendanceModalOpen(false);
    const onAttendanceMarked = async () => await fetchAttendance();

    const closeAttendeeList = () => setAttendeeListOpen(false);
    const openAttendeeList = () => setAttendeeListOpen(true);

    return (
        <Flex w={"full"} h={"full"} direction={"column"}>
            {attendanceModalOpen && <AttendanceCodeModal
                lesson={lesson}
                classroom={classroom}

                isOpen={attendanceModalOpen}
                onClose={onAttendanceModalClosed}
            />}
            <MarkAttendanceCodeModal
                classroom={classroom}
                lesson={lesson}

                isOpen={markAttendanceModalOpen}
                onClose={onMarkAttendanceModalClosed}
                onAttendanceMarked={onAttendanceMarked}
            />
            <AttendeeListModal
                attendees={attendees}
                classroom={classroom}
                lesson={lesson}

                isOpen={attendeeListOpen}
                onClose={closeAttendeeList}
                reloadAttendance={fetchAttendance}
                reloadAttendees={fetchAttendees}
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
                                {lesson.Description ? (
                                    <Text>{lesson.Description}</Text>
                                ) : (
                                    <Text color={"gray"}><i>The classroom owner did not provide a description</i></Text>
                                )}
                                {venue && (
                                    <Box borderWidth={1} borderRadius={"lg"} p={4} mt={3}>
                                        <Stat>
                                            <StatLabel>Lesson venue</StatLabel>
                                            <StatNumber>{venue.Name}</StatNumber>
                                        </Stat>
                                    </Box>
                                )}
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