﻿import * as React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useParams } from "react-router";
import { Link } from "react-router-dom";

import {
    Box,
    Button,
    Flex,
    Heading,
    SimpleGrid,
    Spinner,
    Tab,
    TabList,
    Tabs,
    TabPanel,
    TabPanels,
    Stat, 
    StatLabel, 
    StatNumber, 
    StatHelpText, 
    Wrap, 
    WrapItem, 
    Avatar,
    HStack
} from "@chakra-ui/react";

import authorizationService from "../../oidc/AuthorizationService";

import lessonsApi from "../../api/http/lessons";
import classroomsApi from "../../api/http/classrooms";

import ClassroomInstance from "../../models/Classroom";
import Lesson from "../../models/Lesson";
import Status from "../../models/Status";

import CreateLessonModal from "../../components/app/CreateLessonModal";
import AppNavBar from "../../components/app/AppNavBar";
import User from "../../models/User";
import Venue from "../../models/Venue";

const Classroom = (): React.ReactElement | null => {
    const { classroomId } = useParams<{ classroomId: string }>();

    const [classroom, setClassroom] = useState<ClassroomInstance>({ Id: "", Name: "" });
    const [venues, setVenues] = useState<Venue[]>([]);
    const [isPrivileged, setIsPrivileged] = useState(false);
    const [joinCode, setJoinCode] = useState("");
    const [classroomUsers, setClassroomUsers] = useState<User[]>([]);
    const [userId, setUserId] = useState("");
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [status, setStatus] = useState(Status.Loading);
    const [isCreateLessonModalOpen, setIsCreateLessonModalOpen] = useState(false);

    const teachingLessons = useMemo(() => {
        return lessons.filter(l => l.Teachers.some(t => t.Id === userId));
    }, [lessons, userId]);
    
    
    const fetchClassroomAndPrivileges = useCallback(async () => {
        try {
            const [classroom, owner] = await Promise.all([classroomsApi.find(classroomId), classroomsApi.isPrivileged(classroomId)]);
            if (owner) {
                const [joinCode, classroomUsers] = await Promise.all([classroomsApi.getJoinCode(classroomId), classroomsApi.getUsers(classroomId)]);
                setJoinCode(joinCode);
                setClassroomUsers(classroomUsers);
            }
            setIsPrivileged(owner);
            setClassroom(classroom);
        } catch {
            setStatus(Status.Error);
        }
    }, [classroomId]);

    const fetchLessons = useCallback(async () => {
        try {
            const lessons = await lessonsApi.get(classroomId);
            setLessons(lessons);
        } catch {
            setStatus(Status.Error);
        }
    }, [classroomId]);
    
    const fetchProfile = useCallback(async () => {
        try {
            setUserId((await authorizationService.getUserProfile()).sub);
        } catch {
            setStatus(Status.Error);
        }
    }, []);
    
    const fetchVenues = useCallback(async () => {
        try {
            setVenues(await classroomsApi.getVenues(classroomId));
        } catch {
            setStatus(Status.Error);
        }
    }, [classroomId]);

    useEffect(() => {
        fetchClassroomAndPrivileges();
        fetchProfile();
        fetchLessons();
        fetchVenues();
    }, [fetchClassroomAndPrivileges, fetchProfile, fetchLessons]);
    
    useEffect(() => {
        lessons.length === 0 ? setStatus(Status.Empty) : setStatus(Status.Done);
    }, [lessons]);

    const openCreateLessonModal = () => setIsCreateLessonModalOpen(true);
    const closeCreateLessonModal = () => setIsCreateLessonModalOpen(false);
    
    const onLessonCreated = () => fetchLessons();

    return (
        <Flex w={"full"} h={"full"} direction={"column"}>
            <AppNavBar breadcrumbs={[{ name: classroom.Name, path: "#" }]}/>
            <CreateLessonModal
                classroomId={classroomId}
                venues={venues}

                isOpen={isCreateLessonModalOpen}

                onClose={closeCreateLessonModal}
                onCreate={onLessonCreated}
            />
            <Flex justifyContent={"center"} p={4} style={{ flex: 1 }}>
                {{
                    [Status.Loading]: <Spinner alignSelf={"center"}/>,
                    [Status.Empty]: (
                        <Flex direction={"column"} alignItems={"center"} alignSelf={"center"} style={{ flex: 1 }}>
                            <Heading size={"lg"}>You are not in any lessons yet, create one?</Heading>
                            <Button mt={4} onClick={openCreateLessonModal}>Create lesson</Button>
                        </Flex>
                    ),
                    [Status.Error]: <Heading size={"lg"} alignSelf={"center"}>An unknown error occurred</Heading>,
                    [Status.Done]: (
                        <Flex style={{ flex: 1 }} direction={"column"}>
                            <Box style={{ flex: 1 }}>
                                <Tabs variant="soft-rounded" colorScheme="green">
                                    <TabList>
                                        <Tab>All</Tab>
                                        <Tab>Teaching</Tab>
                                    </TabList>
                                    <TabPanels>
                                        <TabPanel px={0}>
                                            <SimpleGrid minChildWidth={"10rem"} spacing={4}>
                                                {lessons.map((lesson) => (
                                                    <Link
                                                        key={lesson.Id}
                                                        to={{
                                                            pathname: `/app/classrooms/${classroomId}/lessons/${lesson.Id}`,
                                                            state: {
                                                                classroom,
                                                                lesson
                                                            }
                                                        }}
                                                    >
                                                        <Box
                                                            h={"40"}
                                                            p={3}
                                                            bg={"blue.800"}
                                                            borderRadius={"lg"}
                                                            style={{ cursor: "pointer" }}
                                                        >
                                                            <Heading size={"md"}>{lesson.Name}</Heading>
                                                        </Box>
                                                    </Link>
                                                ))}
                                            </SimpleGrid>
                                        </TabPanel>
                                        <TabPanel px={0}>
                                            <SimpleGrid minChildWidth={"10rem"} spacing={4}>
                                                {teachingLessons.map((lesson) => (
                                                    <Link
                                                        key={lesson.Id}
                                                        to={{
                                                            pathname: `/app/classrooms/${classroomId}/lessons/${lesson.Id}`,
                                                            state: {
                                                                classroom,
                                                                lesson
                                                            }
                                                        }}
                                                    >
                                                        <Box
                                                            h={"40"}
                                                            p={3}
                                                            bg={"blue.800"}
                                                            borderRadius={"lg"}
                                                            style={{ cursor: "pointer" }}
                                                        >
                                                            <Heading size={"md"}>{lesson.Name}</Heading>
                                                        </Box>
                                                    </Link>
                                                ))}
                                            </SimpleGrid>
                                        </TabPanel>
                                    </TabPanels>
                                </Tabs>
                            </Box>
                            <Button mt={4} onClick={openCreateLessonModal}>Create lesson</Button>
                        </Flex>
                    )
                }[status]}
                {isPrivileged && (
                    <Box borderWidth={1} borderRadius={"lg"} p={4} ml={5}>
                        <Stat>
                            <StatLabel>Join code</StatLabel>
                            <StatNumber>{joinCode}</StatNumber>
                            <StatHelpText>Anyone with this<br/>code can join this classroom</StatHelpText>
                        </Stat>
                        <Heading size={"md"} mb={2}>Users</Heading>
                        <Wrap maxW={"3xs"}>
                            {classroomUsers.map((user, idx) => (
                                <WrapItem key={idx.toString()}>
                                    <Avatar name={user.Name}/>
                                </WrapItem>
                            ))}
                        </Wrap>
                        <HStack spacing={"2"} mt={5}>
                            <Link to={`/app/classrooms/${classroomId}/dashboard`}>
                                <Button colorScheme={"blue"}>Dashboard</Button>
                            </Link>
                            <Link to={`/app/classrooms/${classroomId}/settings`}>
                                <Button colorScheme={"cyan"}>Settings</Button>
                            </Link>
                        </HStack>
                    </Box>
                )}
            </Flex>
        </Flex>
    );
};

export default Classroom;