import * as React from "react";
import { useEffect, useState, useCallback, useMemo } from "react";

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
    IconButton,
    Stat,
    StatLabel,
    StatNumber,
    VStack, HStack, Alert, AlertIcon, AlertTitle, AlertDescription
} from "@chakra-ui/react";
import { RepeatIcon } from "@chakra-ui/icons";
import { fromUnixTime, format } from "date-fns";

import Classroom from "../../models/Classroom";
import LessonInstance from "../../models/Lesson";
import Status from "../../models/Status";
import Assignment from "../../models/Assignment";

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
import CreateAssignmentModal from "../../components/app/lesson/CreateAssignmentModal";
import AssignmentCard from "../../components/app/lesson/AssignmentCard";

const Lesson = (): React.ReactElement => {
    const { classroomId, lessonId } = useParams<{ classroomId: string; lessonId: string }>();

    const [isTeacher, setIsTeacher] = useState(false);
    const [attendees, setAttendees] = useState<User[]>([]);
    const [attendance, setAttendance] = useState(false);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
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
    const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
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
            if (venue) {
                setVenue(venue);
            }
        } catch (e) {
            console.error(e);
            setStatus(Status.Error);
        }
    }, [classroomId, lessonId]);

    const fetchAssignments = useCallback(async () => {
        try {
            const assignments = await lessonsApi.getAssignments(classroomId, lessonId);
            const sorted = assignments.sort((a, b) => b.DueDate - a.DueDate);
            setAssignments(sorted);
        } catch (e) {
            console.error(e);
            setStatus(Status.Error);
        }
    }, [classroomId, lessonId]);

    const startDate = useMemo(() => {
        const date = fromUnixTime(lesson.StartDate);
        return format(date, "dd/MM/yyyy HH:mm");
    }, [lesson]);

    const endDate = useMemo(() => {
        const date = fromUnixTime(lesson.EndDate);
        return format(date, "dd/MM/yyyy HH:mm");
    }, [lesson]);

    useEffect(() => {
        fetchClassroom();
        fetchLesson();
        fetchAttendance();
        fetchVenue();
        fetchAssignments();
        setStatus(Status.Done);
    }, [fetchClassroom, fetchLesson, fetchAttendance]);

    const navigateToMeeting = () => window.location.href = lesson.MeetingUri;
    const openAttendanceModal = () => setAttendanceModalOpen(true);
    const onAttendanceModalClosed = () => setAttendanceModalOpen(false);

    const openMarkAttendanceModal = () => setMarkAttendanceModalOpen(true);
    const onMarkAttendanceModalClosed = () => setMarkAttendanceModalOpen(false);
    const onAttendanceMarked = async () => await fetchAttendance();

    const openCreateAssignmentModal = () => setAssignmentModalOpen(true);
    const onCreateAssignmentModalClosed = () => setAssignmentModalOpen(false);
    const onAssignmentCreated = async () => await fetchAssignments();

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
            <CreateAssignmentModal
                classroom={classroom}
                lesson={lesson}

                isOpen={assignmentModalOpen}
                onClose={onCreateAssignmentModalClosed}
                onCreate={onAssignmentCreated}
            />
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
                        <Wrap style={{ flex: 1 }}>
                            <WrapItem>
                                <Box>
                                    <Heading>{lesson.Name}</Heading>
                                    {lesson.Description ? (
                                        <Text>{lesson.Description}</Text>
                                    ) : (
                                        <Text color={"gray"}><i>There is no description for this class</i></Text>
                                    )}
                                    {venue && (
                                        <Box borderWidth={1} borderRadius={"lg"} p={4} mt={3}>
                                            <Stat>
                                                <StatLabel>Lesson venue</StatLabel>
                                                <StatNumber>{venue.Name}</StatNumber>
                                            </Stat>
                                        </Box>
                                    )}
                                    <Box borderWidth={1} borderRadius={"lg"} p={4} mt={3}>
                                        <Stat>
                                            <StatLabel>Lesson start</StatLabel>
                                            <StatNumber>{startDate}</StatNumber>
                                        </Stat>
                                        <Stat>
                                            <StatLabel>Lesson end</StatLabel>
                                            <StatNumber>{endDate}</StatNumber>
                                        </Stat>
                                    </Box>
                                    <Box mt={3}>
                                        <Button onClick={navigateToMeeting} colorScheme={"teal"} size={"lg"}>
                                            Go to meeting
                                        </Button>
                                        {!attendance && (
                                            <Button onClick={openMarkAttendanceModal} colorScheme={"red"} size={"lg"}>
                                                Mark my attendance
                                            </Button>
                                        )}
                                    </Box>
                                </Box>
                            </WrapItem>
                            <WrapItem style={{ flex: 1 }} display={"flex"}>
                                <Box style={{ flex: 1 }}>
                                    <Heading mb={3}>Assignments</Heading>
                                    {assignments.length === 0 && (
                                        <Alert
                                            status="success"
                                            variant="subtle"
                                            flexDirection="column"
                                            alignItems="center"
                                            justifyContent="center"
                                            textAlign="center"
                                            height="200px"
                                        >
                                            <AlertIcon boxSize="40px" mr={0}/>
                                            <AlertTitle mt={4} mb={1} fontSize="lg">
                                                No assignments!
                                            </AlertTitle>
                                            <AlertDescription maxWidth="sm">
                                                Wow, you have no assignments! I wish I was this lucky as well...
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                    {assignments.map((assignment, idx) => (
                                        <AssignmentCard assignment={assignment} key={idx.toString()}/>
                                    ))}
                                </Box>
                            </WrapItem>
                        </Wrap>
                    )
                }[status]}
                {isTeacher && (
                    <Box borderWidth={1} borderRadius={"lg"} p={4} ml={5}>
                        <VStack spacing={"2"} align={"flex-end"}>
                            <Button colorScheme={"blue"} onClick={openAttendanceModal}>Show
                                attendance code</Button>
                            <Button colorScheme={"teal"} onClick={openCreateAssignmentModal}>Create assignment</Button>
                        </VStack>
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