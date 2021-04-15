import * as React from "react";
import { useEffect, useState } from "react";

import { Link } from "react-router-dom";
import { Heading, Flex, Spinner, Button, Box, SimpleGrid } from "@chakra-ui/react";

import AppNavBar from "../../components/app/AppNavBar";
import classroomsApi from "../../api/http/Classroom";

import Status from "../../models/Status";
import ClassroomInstance from "../../models/Classroom";
import CreateClassroomModal from "../../components/app/CreateClassroomModal";
import JoinClassroomModal from "../../components/app/JoinClassroomModal";

const Home = (): React.ReactElement => {
    const [classrooms, setClassrooms] = useState<ClassroomInstance[]>([]);
    const [isCreateClassroomModalOpen, setIsCreateClassroomModalOpen] = useState(false);
    const [isJoinClassroomModalOpen, setIsJoinClassroomModalOpen] = useState(false);
    const [status, setStatus] = useState(Status.Loading);

    const getClassrooms = async () => {
        try {
            setStatus(Status.Loading);
            const classrooms = await classroomsApi.get();
            setClassrooms(classrooms);
            classrooms.length === 0 ? setStatus(Status.Empty) : setStatus(Status.Done);
        } catch {
            setStatus(Status.Error);
        }
    };

    useEffect(() => {
        getClassrooms();
    }, []);

    const openCreateClassroomModal = () => setIsCreateClassroomModalOpen(true);
    const closeCreateClassroomModal = () => setIsCreateClassroomModalOpen(false);
    const onCreateClassroom = () => getClassrooms();

    const openJoinClassroomModal = () => setIsJoinClassroomModalOpen(true);
    const closeJoinClassroomModal = () => setIsJoinClassroomModalOpen(false);
    const onJoinClassroom = () => getClassrooms();

    return (
        <Flex w={"full"} h={"full"} direction={"column"}>
            <JoinClassroomModal
                isOpen={isJoinClassroomModalOpen}

                onJoin={onJoinClassroom}
                onClose={closeJoinClassroomModal}
            />
            <CreateClassroomModal
                isOpen={isCreateClassroomModalOpen}

                onCreate={onCreateClassroom}
                onClose={closeCreateClassroomModal}
            />
            <AppNavBar/>
            <Flex justifyContent={"center"} flexDirection={"column"} p={4} style={{ flex: 1 }}>
                {{
                    [Status.Loading]: <Spinner alignSelf={"center"}/>,
                    [Status.Empty]: (
                        <Flex direction={"column"} alignItems={"center"} alignSelf={"center"}>
                            <Heading size={"lg"}>You are not in any classrooms yet, create one?</Heading>
                        </Flex>
                    ),
                    [Status.Error]: <Heading size={"lg"} alignSelf={"center"}>An unknown error occurred</Heading>,
                    [Status.Done]: (
                        <Flex style={{ flex: 1 }} direction={"column"}>
                            <Box style={{ flex: 1 }}>
                                <SimpleGrid minChildWidth={"10rem"} spacing={4}>
                                    {classrooms.map((classroom) => (
                                        <Link
                                            key={classroom.Id}

                                            to={{
                                                pathname: `/app/classrooms/${classroom.Id}`,
                                            }}>
                                            <Box
                                                h={"40"}
                                                p={3}
                                                bg={"blue.800"}
                                                borderRadius={"lg"}
                                                style={{ cursor: "pointer" }}
                                            >
                                                <Heading size={"md"}>{classroom.Name}</Heading>
                                            </Box>
                                        </Link>
                                    ))}
                                </SimpleGrid>
                            </Box>
                        </Flex>
                    )
                }[status]}
                <Button mt={4} onClick={openCreateClassroomModal}>Create classroom</Button>
                <Button mt={4} onClick={openJoinClassroomModal}>Join classroom</Button>
            </Flex>
        </Flex>
    );
};

export default Home;