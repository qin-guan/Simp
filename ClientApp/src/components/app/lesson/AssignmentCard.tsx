import * as React from "react";
import {
    Box,
    Flex,
    Heading,
    HStack,
    Spacer,
    Stat,
    StatLabel,
    StatNumber,
    Tag,
    Text,
    Wrap,
    WrapItem
} from "@chakra-ui/react";
import Assignment from "../../../models/Assignment";
import { useCallback } from "react";
import { format, fromUnixTime } from "date-fns";

interface AssignmentCardProps {
    assignment: Assignment;
}

const AssignmentCard = (props: AssignmentCardProps): React.ReactElement => {
    const { assignment } = props;

    const dueDate = useCallback((input: number) => {
        const date = fromUnixTime(input);
        return format(date, "dd/MM/yyyy");
    }, []);

    return (
        <Box
            p={4}
            mt={3}
            bg={fromUnixTime(assignment.DueDate) < new Date() ? "red.800" : "teal.800"}
            cursor={"pointer"}
            borderWidth={3}
            borderRadius={"lg"}
            transition={"0.15s"}
            sx={{ "&:hover": { "borderColor": fromUnixTime(assignment.DueDate) < new Date() ? "red.400" : "teal.400" } }}
        >
            <Wrap justify={"space-between"}>
                <WrapItem>
                    <Box>
                        <Heading size={"md"}>{assignment.Name}</Heading>
                        {assignment.Description ? (
                            <Text>{assignment.Description}</Text>
                        ) : (
                            <Text color={"gray"}><i>There is no description for this
                                assignment</i></Text>
                        )}
                    </Box>
                </WrapItem>
                <WrapItem>
                    <HStack spacing={"5"}>
                        <Stat>
                            <StatLabel>Points</StatLabel>
                            <StatNumber>{assignment.Points}</StatNumber>
                        </Stat>

                        <Stat>
                            <StatLabel>Due date</StatLabel>
                            <StatNumber>{dueDate(assignment.DueDate)}</StatNumber>
                        </Stat>
                    </HStack>
                </WrapItem>
            </Wrap>
        </Box>
    );
};

export default AssignmentCard;