package com.rophim.legacy.service;

import com.rophim.legacy.models.Ranking;
import com.rophim.legacy.repository.RankingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AIService {

    private final RankingRepository rankingRepository;
    private final RestClient restClient = RestClient.create();

    @Value("${google.api.key}")
    private String googleApiKey;

    @Value("${base.prompt.template}")
    private String basePromptTemplate;

    public Ranking analyzeReview(String adminReview) {
        log.info("API check: {}", googleApiKey);
        log.info("Analyzing review with AI...");
        List<Ranking> rankings = rankingRepository.findAll();

        String sentimentDelimited = rankings.stream()
                .filter(r -> r.getRankingValue() != null && r.getRankingValue() != 999)
                .map(Ranking::getRankingName)
                .filter(name -> name != null)
                .collect(Collectors.joining(", "));

        String sanitizedReview = adminReview != null ? adminReview.replace("<review>", "").replace("</review>", "")
                : "";

        String prompt = basePromptTemplate.replace("{rankings}", sentimentDelimited)
                + "\n\n<review>\n"
                + sanitizedReview
                + "\n</review>";

        String responseText = callGeminiApi(prompt);
        log.info("AI Response: {}", responseText);

        return rankings.stream()
                .filter(r -> r.getRankingName() != null && r.getRankingName().equalsIgnoreCase(responseText.trim()))
                .findFirst()
                .orElseGet(() -> {
                    log.warn("AI returned unknown ranking: {}. Defaulting to Neutral (0)", responseText);
                    return rankings.stream()
                            .filter(r -> r.getRankingValue() != null && r.getRankingValue() == 0)
                            .findFirst()
                            .orElse(null);
                });
    }

    @SuppressWarnings("null")
    private String callGeminiApi(String prompt) {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent";

        JSONObject requestBody = new JSONObject();
        JSONArray parts = new JSONArray();
        parts.put(new JSONObject().put("text", prompt));
        requestBody.put("contents", new JSONArray().put(new JSONObject().put("parts", parts)));

        try {
            String response = restClient.post()
                    .uri(url)
                    .header("x-goog-api-key", googleApiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody.toString())
                    .retrieve()
                    .body(String.class);

            if (response == null || response.trim().isEmpty()) {
                log.error("Google Gemini API returned a null or empty response");
                return "Neutral";
            }
            JSONObject jsonResponse = new JSONObject(response);

            // VÁ LỖI 3: Kiểm tra an toàn trước khi bóc tách JSON
            JSONArray candidates = jsonResponse.optJSONArray("candidates");
            if (candidates != null && candidates.length() > 0) {
                JSONObject firstCandidate = candidates.getJSONObject(0);
                if (firstCandidate.has("content")) {
                    return firstCandidate.getJSONObject("content")
                            .getJSONArray("parts")
                            .getJSONObject(0)
                            .getString("text");
                } else {
                    log.warn("Gemini API blocked the response (possibly safety filter). Reason: {}",
                            firstCandidate.optString("finishReason"));
                    return "Neutral";
                }
            }
            return "Neutral";

        } catch (Exception e) {
            log.error("Error calling Gemini API", e);
            return "Neutral";
        }
    }
}