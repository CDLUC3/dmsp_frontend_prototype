const publishedCustomQuestionsMock = {
    publishedCustomQuestions: [
        {
            __typename: "PublishedQuestion",
            id: 7,
            questionText: "Custom Radio Button Question",
            guidanceText: "",
            requirementText: "",
            sampleText: "",
            useSampleTextAsDefault: null,
            required: false,
            hasAnswer: false,
            questionType: "CUSTOM",
            versionedQuestionId: null,
            customQuestionId: 7,
            json: '{"meta":{"schemaVersion":"1.0"},"type":"radioButtons","options":[{"label":"Apple","value":"Apple","selected":false},{"label":"Orange","value":"Orange","selected":false},{"label":"Banana","value":"Banana","selected":true}],"attributes":{},"showCommentField":true}'
        }
    ]
};

export default publishedCustomQuestionsMock;