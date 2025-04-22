import React, { useState } from 'react';
import { testCorsRequest, diagnoseCorsIssues, getCorsRecommendations } from '../../utils/corsHelper';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Select,
  Stack,
  Text,
  Textarea,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  List,
  ListItem,
  ListIcon,
  Code,
  Spinner,
  Badge,
} from '@chakra-ui/react';
import { CheckCircleIcon, WarningIcon, InfoIcon } from '@chakra-ui/icons';

/**
 * CORS Diagnostic Page Component
 * A utility page for diagnosing CORS issues with the API
 */
const CorsDiagnostic = () => {
  const [apiUrl, setApiUrl] = useState(process.env.REACT_APP_API_URL || 'http://localhost:8765/api/v1');
  const [endpoint, setEndpoint] = useState('/health');
  const [method, setMethod] = useState('GET');
  const [requestBody, setRequestBody] = useState('');
  const [results, setResults] = useState(null);
  const [diagnosticResults, setDiagnosticResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTestRequest = async () => {
    setLoading(true);
    try {
      let parsedBody = null;
      if (requestBody && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        try {
          parsedBody = JSON.parse(requestBody);
        } catch (err) {
          setResults({
            success: false,
            error: 'Invalid JSON in request body',
            details: err.message
          });
          setLoading(false);
          return;
        }
      }

      const result = await testCorsRequest(endpoint, method, parsedBody);
      setResults(result);
    } catch (error) {
      setResults({
        success: false,
        error: error.message,
        details: error.toString()
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRunDiagnostic = async () => {
    setLoading(true);
    try {
      const result = await diagnoseCorsIssues();
      setDiagnosticResults(result);
    } catch (error) {
      setDiagnosticResults({
        results: { error: error.message },
        recommendations: ['An error occurred during diagnosis']
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxW="container.lg" py={8}>
      <Heading as="h1" size="xl" mb={6}>
        CORS Diagnostic Tool
      </Heading>
      <Text mb={4}>
        This tool helps diagnose Cross-Origin Resource Sharing (CORS) issues when connecting to your API.
      </Text>

      <Box bg="white" p={6} borderRadius="md" boxShadow="md" mb={8}>
        <Heading as="h2" size="md" mb={4}>
          Test Specific Endpoint
        </Heading>
        <Stack spacing={4}>
          <FormControl>
            <FormLabel>API URL</FormLabel>
            <Input
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="e.g., http://localhost:8765/api/v1"
            />
          </FormControl>

          <FormControl>
            <FormLabel>Endpoint</FormLabel>
            <Input
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              placeholder="e.g., /health"
            />
          </FormControl>

          <FormControl>
            <FormLabel>Method</FormLabel>
            <Select value={method} onChange={(e) => setMethod(e.target.value)}>
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
              <option value="PATCH">PATCH</option>
              <option value="OPTIONS">OPTIONS</option>
            </Select>
          </FormControl>

          {(method === 'POST' || method === 'PUT' || method === 'PATCH') && (
            <FormControl>
              <FormLabel>Request Body (JSON)</FormLabel>
              <Textarea
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
                placeholder='{"key": "value"}'
                rows={4}
              />
            </FormControl>
          )}

          <Stack direction="row" spacing={4} align="center" justify="flex-start">
            <Button
              onClick={handleTestRequest}
              colorScheme="blue"
              isLoading={loading}
              loadingText="Testing..."
            >
              Test Request
            </Button>
            <Button
              onClick={handleRunDiagnostic}
              colorScheme="teal"
              isLoading={loading}
              loadingText="Diagnosing..."
            >
              Run Full Diagnosis
            </Button>
          </Stack>
        </Stack>
      </Box>

      {loading && (
        <Box textAlign="center" my={8}>
          <Spinner size="xl" />
          <Text mt={2}>Running tests...</Text>
        </Box>
      )}

      {results && !loading && (
        <Box bg="white" p={6} borderRadius="md" boxShadow="md" mb={8}>
          <Heading as="h2" size="md" mb={4}>
            Test Results
            <Badge
              ml={2}
              colorScheme={results.success ? 'green' : 'red'}
            >
              {results.success ? 'SUCCESS' : 'FAILED'}
            </Badge>
          </Heading>

          {results.success ? (
            <>
              <Alert status="success" mb={4}>
                <AlertIcon />
                <AlertTitle>Success!</AlertTitle>
                <AlertDescription>
                  Your request completed successfully with status {results.status} ({results.statusText})
                </AlertDescription>
              </Alert>
              
              <Heading as="h3" size="sm" mb={2}>
                Response Headers:
              </Heading>
              <Code p={2} borderRadius="md" display="block" whiteSpace="pre" overflow="auto" mb={4}>
                {JSON.stringify(results.headers, null, 2)}
              </Code>
              
              <Heading as="h3" size="sm" mb={2}>
                Response Data:
              </Heading>
              <Code p={2} borderRadius="md" display="block" whiteSpace="pre" overflow="auto">
                {JSON.stringify(results.data, null, 2)}
              </Code>
            </>
          ) : (
            <>
              <Alert status="error" mb={4}>
                <AlertIcon />
                <AlertTitle>Failed!</AlertTitle>
                <AlertDescription>
                  {results.isCorsError 
                    ? 'CORS error detected!' 
                    : `Request failed: ${results.error}`}
                </AlertDescription>
              </Alert>
              
              {results.isCorsError && (
                <>
                  <Heading as="h3" size="sm" mb={2}>
                    CORS Error Analysis:
                  </Heading>
                  <List spacing={2} mb={4}>
                    {getCorsRecommendations(results.error).map((rec, index) => (
                      <ListItem key={index}>
                        <ListIcon as={InfoIcon} color="blue.500" />
                        {rec}
                      </ListItem>
                    ))}
                  </List>
                </>
              )}
              
              <Heading as="h3" size="sm" mb={2}>
                Error Details:
              </Heading>
              <Code p={2} borderRadius="md" display="block" whiteSpace="pre" overflow="auto">
                {results.details}
              </Code>
              
              {results.request && (
                <>
                  <Heading as="h3" size="sm" mt={4} mb={2}>
                    Request Details:
                  </Heading>
                  <Code p={2} borderRadius="md" display="block" whiteSpace="pre" overflow="auto">
                    {JSON.stringify(results.request, null, 2)}
                  </Code>
                </>
              )}
            </>
          )}
        </Box>
      )}

      {diagnosticResults && !loading && (
        <Box bg="white" p={6} borderRadius="md" boxShadow="md">
          <Heading as="h2" size="md" mb={4}>
            Diagnostic Results
          </Heading>
          
          {diagnosticResults.recommendations.length > 0 ? (
            <Alert status="warning" mb={4}>
              <AlertIcon />
              <Box flex="1">
                <AlertTitle>Issues Found</AlertTitle>
                <AlertDescription>
                  The following issues were detected:
                </AlertDescription>
              </Box>
            </Alert>
          ) : (
            <Alert status="success" mb={4}>
              <AlertIcon />
              <Box flex="1">
                <AlertTitle>No Issues Found</AlertTitle>
                <AlertDescription>
                  Your CORS configuration appears to be working correctly!
                </AlertDescription>
              </Box>
            </Alert>
          )}
          
          {diagnosticResults.recommendations.length > 0 && (
            <>
              <Heading as="h3" size="sm" mb={2}>
                Recommendations:
              </Heading>
              <List spacing={2} mb={4}>
                {diagnosticResults.recommendations.map((rec, index) => (
                  <ListItem key={index}>
                    <ListIcon as={WarningIcon} color="orange.500" />
                    {rec}
                  </ListItem>
                ))}
              </List>
            </>
          )}
          
          <Divider my={4} />
          
          <Heading as="h3" size="sm" mb={2}>
            Test Results Details:
          </Heading>
          <Code p={2} borderRadius="md" display="block" whiteSpace="pre" overflow="auto">
            {JSON.stringify(diagnosticResults.results, null, 2)}
          </Code>
        </Box>
      )}
    </Container>
  );
};

export default CorsDiagnostic; 