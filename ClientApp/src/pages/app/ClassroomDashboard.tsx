import * as React from "react";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router";

import { Flex, Heading, Spinner, Stat } from "@chakra-ui/react";

import AppNavBar from "../../components/app/AppNavBar";

import classroomsApi from "../../api/http/classrooms";

import ClassroomInstance from "../../models/Classroom";
import Status from "../../models/Status";
import User from "../../models/User";
import Lesson from "../../models/Lesson";

const ClassroomDashboard = (): React.ReactElement => {
    const { classroomId } = useParams<{ classroomId: string }>();

    const [classroom, setClassroom] = useState<ClassroomInstance>({ Id: "", Name: "" });
    const [classroomUsers, setClassroomUsers] = useState<User[]>([]);
    const [userId, setUserId] = useState("");
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [status, setStatus] = useState(Status.Loading);
    
    const fetchPrivileges = useCallback(async () => {
        try {
            const owner = await classroomsApi.isPrivileged(classroomId);
            if (!owner) {
                window.location.href = "/app";
                return;
            }
        } catch {
            setStatus(Status.Error);
        }
    }, [classroomId]);
    
    const fetchClassroomDetails = useCallback(async () => {
        try {
            const [classroom, classroomUsers] = await Promise.all([classroomsApi.find(classroomId), classroomsApi.getUsers(classroomId)]);

            setClassroomUsers(classroomUsers);
            setClassroom(classroom);
        } catch {
            setStatus(Status.Error);
        }
    }, [classroomId]);

    useEffect(() => {
        fetchPrivileges();
        fetchClassroomDetails();
        
        setStatus(Status.Done);
    }, []);

    return (
        <Flex w={"full"} h={"full"} direction={"column"}>
            <AppNavBar breadcrumbs={[{ name: classroom.Name, path: `/app/classrooms/${classroom.Id}` }, {
                name: "Dashboard",
                path: "#"
            }]}/>
            <Flex justifyContent={"center"} p={4} style={{ flex: 1 }}>
                {{
                    [Status.Loading]: <Spinner alignSelf={"center"}/>,
                    [Status.Empty]: (
                        <Flex direction={"column"} alignItems={"center"} alignSelf={"center"} style={{ flex: 1 }}>
                            <Heading size={"lg"}>No statics available</Heading>
                        </Flex>
                    ),
                    [Status.Error]: <Heading size={"lg"} alignSelf={"center"}>An unknown error occurred</Heading>,
                    [Status.Done]: (
                        <Flex style={{ flex: 1 }} direction={"column"}>
                            <Heading>Dashboard</Heading>
                        </Flex>
                    )
                }[status]}
            </Flex>
        </Flex>
    );
};

export default ClassroomDashboard;