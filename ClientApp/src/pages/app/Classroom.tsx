import * as React from "react";
import { useEffect, useMemo, useState } from "react";

import { useLocation, useParams } from "react-router";
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
    TabPanels
} from "@chakra-ui/react";

import authorizationService from "../../oidc/AuthorizationService";

import lessonsApi from "../../api/http/Lesson";
import classroomsApi from "../../api/http/Classroom";

import ClassroomInstance from "../../models/Classroom";
import Lesson from "../../models/Lesson";
import Status from "../../models/Status";

import CreateLessonModal from "../../components/app/CreateLessonModal";
import AppNavBar from "../../components/app/AppNavBar";

const Classroom = (): React.ReactElement | null => {
    const { classroomId } = useParams<{classroomId: string}>();
    
    const [classroom, setClassroom] = useState<ClassroomInstance>({ Id: "", Name: "" });
    const [userId, setUserId] = useState("");
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [status, setStatus] = useState(Status.Loading);
    const [isCreateLessonModalOpen, setIsCreateLessonModalOpen] = useState(false);

    const teachingLessons = useMemo(() => {
        return lessons.filter(l => l.Teachers.some(t => t.Id === userId));
    }, [lessons]);

    const getLessons = async () => {
        try {
            setStatus(Status.Loading);
            const lessons = await lessonsApi.get(classroomId);
            setLessons(lessons);
            lessons.length === 0 ? setStatus(Status.Empty) : setStatus(Status.Done);
        } catch {
            setStatus(Status.Error);
        }
    };

    const getProfile = async () => {
        setUserId((await authorizationService.getUserProfile()).sub);
    };

    useEffect(() => {
        const findClassroom = async () => {
            try {
                const classroom = await classroomsApi.find(classroomId);
                setClassroom(classroom);
            } catch {
                setStatus(Status.Error);
            }
        };
        
        findClassroom();
        getProfile();
        getLessons();
    }, []);

    const openCreateLessonModal = () => setIsCreateLessonModalOpen(true);
    const closeCreateLessonModal = () => setIsCreateLessonModalOpen(false);
    const onCreateLesson = () => getLessons();

    return (
        <Flex w={"full"} h={"full"} direction={"column"}>
            <AppNavBar breadcrumbs={[{ name: classroom.Name, path: "#" }]}/>
            <CreateLessonModal
                classroomId={classroomId}

                isOpen={isCreateLessonModalOpen}

                onClose={closeCreateLessonModal}
                onCreate={onCreateLesson}
            />
            <Flex justifyContent={"center"} p={4} style={{ flex: 1 }}>
                {{
                    [Status.Loading]: <Spinner alignSelf={"center"}/>,
                    [Status.Empty]: (
                        <Flex direction={"column"} alignItems={"center"} alignSelf={"center"}>
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
                                        <TabPanel>
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
            </Flex>
        </Flex>
    );
};

export default Classroom;