"use client";

import "@upstash/search-ui/dist/index.css";
import Image from "next/image";
import { apiClient } from "../utils/client";
import SearchUI from "@/components/search-ui";
import {
  Input,
  Button,
  Card,
  Typography,
  Space,
  Row,
  Col,
  Layout,
  Steps,
  Spin,
  Flex,
} from "antd";
import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import { Youtube, Search, FileText, ArrowLeft } from "lucide-react";

const { Title, Text, Paragraph } = Typography;
const { Header, Content, Footer } = Layout;

enum Step {
  URL_INPUT,
  INDEXING,
  SEARCHING,
}

export default function Page() {
  const [url, setUrl] = useState("");
  const [step, setStep] = useState(Step.URL_INPUT);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMoment, setSelectedMoment] = useState<string>("0");

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const isValidYouTubeUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return (
        urlObj.hostname.includes("youtube.com") ||
        urlObj.hostname.includes("youtu.be")
      );
    } catch {
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!isValidYouTubeUrl(url)) {
      toast.error("Please enter a valid Youtube URL");
      return;
    }

    const videoId = url.split("v=")[1]?.split("&")[0];
    if (!videoId) {
      toast.error("Could not extract video ID from the URL.");
      return;
    }
    setVideoId(videoId);
    setStep(Step.INDEXING);

    try {
      const isIndexed = await apiClient.checkIndex(videoId);

      if (isIndexed) {
        setStep(Step.SEARCHING);
        return;
      }

      await apiClient.indexVideo(url, videoId);
      setStep(Step.SEARCHING);
    } catch (error) {
      toast.error("Error indexing captions");
      setStep(Step.URL_INPUT);
    }
  };

  const renderUrlInput = () => (
    <Content
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "24px",
      }}
    >
      <Card
        style={{
          maxWidth: "800px",
          width: "100%",
          borderRadius: "16px",
          boxShadow:
            "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <Title level={1}>Video Search</Title>
          <Text style={{ fontSize: "18px", color: "#4b5563" }}>
            Transform any YouTube video into a searchable experience
          </Text>
        </div>
        <div style={{ marginBottom: "32px" }}>
          <Title
            level={3}
            style={{ textAlign: "center", marginBottom: "24px" }}
          >
            How It Works
          </Title>
          <Steps>
            <Steps.Step status="process" title="Paste URL" icon={<Youtube />} />
            <Steps.Step
              status="process"
              title="Index Captions"
              icon={<FileText />}
            />
            <Steps.Step
              status="process"
              title="Search on Video"
              icon={<Search />}
            />
          </Steps>
        </div>

        <Space direction="vertical" style={{ width: "100%" }} size="large">
          <Input
            size="large"
            placeholder="https://www.youtube.com/watch?v=..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onPressEnter={handleSubmit}
            allowClear
          />
        </Space>
      </Card>
    </Content>
  );

  const renderIndexing = () => (
    <Content
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <div>
        <Spin size="large" />
        <Title level={3} style={{ marginTop: 24 }}>
          Indexing is in progress...
        </Title>
        <Text>Please wait while we extract and index the video captions.</Text>
      </div>
    </Content>
  );

  const renderSearching = () => (
    <Content style={{ padding: "24px 48px" }}>
      <Row gutter={[32, 32]}>
        <Col xs={24} lg={14}>
          <div
            style={{
              position: "relative",
              paddingBottom: "56.25%",
              height: 0,
            }}
          >
            <iframe
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                borderRadius: "8px",
              }}
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&start=${selectedMoment}`}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            ></iframe>
          </div>
        </Col>
        <Col xs={24} lg={10}>
          <Title level={3}>Search Moments</Title>
          <Paragraph>
            Search for any topic, name, or phrase mentioned in the video. Click
            on any result to jump directly to that moment.
          </Paragraph>
          {videoId && (
            <SearchUI videoId={videoId} setSelectedMoment={setSelectedMoment} />
          )}
        </Col>
      </Row>
    </Content>
  );

  const renderStep = () => {
    switch (step) {
      case Step.URL_INPUT:
        return renderUrlInput();
      case Step.INDEXING:
        return renderIndexing();
      case Step.SEARCHING:
        return renderSearching();
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <Flex
        align="center"
        justify="center"
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #e6fffa 0%, #b9f6ca 100%)",
        }}
      >
        <Spin size="large" />
      </Flex>
    );
  }

  return (
    <Layout
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #e6fffa 0%, #b9f6ca 100%)",
      }}
    >
      <Header
        style={{
          background: "transparent",
          padding: "0 48px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Flex align="center" gap="small">
          <Image src="/upstash.png" alt="Logo" width={32} height={32} />
          <Title level={4} style={{ margin: 0 }}>
            Upstash Search
          </Title>
        </Flex>

        {step === Step.SEARCHING && (
          <Button
            icon={<ArrowLeft size={16} />}
            onClick={() => {
              setStep(Step.URL_INPUT);
              setUrl("");
              setVideoId(null);
              setSelectedMoment("0");
            }}
          >
            Search Another Video
          </Button>
        )}
      </Header>
      {renderStep()}
      <Footer style={{ textAlign: "center", background: "transparent" }}>
        <Text style={{ color: "#4b5563" }}>
          Powered by{" "}
          <a
            href="https://upstash.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Upstash
          </a>
        </Text>
      </Footer>
      <ToastContainer />
    </Layout>
  );
}
