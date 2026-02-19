import { BusinessEntity, EngagementScore, EngagementBreakdown } from '../types';

export const calculateEngagementScore = (entity: BusinessEntity): EngagementScore => {
    // 1. Recent Signals (Max 40 pts) - Cap at 5 signals
    const signals = entity.signals || [];
    const recentSignalCount = signals.length; // In real app, filter by date window
    const signalScore = Math.min(recentSignalCount, 5) / 5 * 40;

    // 2. Signal Confidence Avg (Max 25 pts)
    const avgConfidence = signals.length > 0
        ? signals.reduce((acc, s) => acc + (s.confidence || 0), 0) / signals.length
        : 0;
    const confidenceScore = avgConfidence * 25;

    // 3. Contact Completeness (Max 20 pts)
    const contacts = entity.contacts || [];
    const hasEmail = contacts.some(c => c.email);
    const hasPhone = contacts.some(c => c.phone);
    const hasLinkedin = contacts.some(c => c.channel === 'linkedin');

    let contactScore = 0;
    if (contacts.length > 0) contactScore += 5;
    if (hasEmail) contactScore += 5;
    if (hasPhone) contactScore += 5;
    if (hasLinkedin) contactScore += 5;
    // Cap at 20 just in case logic changes
    contactScore = Math.min(contactScore, 20);

    // 4. User Interactions (Max 15 pts) - Placeholder for now as we don't have interaction history in entity yet
    // We can default to 0 for fresh leads
    const interactionScore = 0;

    const totalScore = Math.round(signalScore + confidenceScore + contactScore + interactionScore);

    // Generate Explanation
    const explanation = `Score based on ${recentSignalCount} signal${recentSignalCount !== 1 ? 's' : ''}, ${(avgConfidence * 100).toFixed(0)}% avg confidence, and ${contacts.length > 0 ? 'verified contacts' : 'no contact data'}.`;

    const breakdown: EngagementBreakdown = {
        signal_count: recentSignalCount,
        confidence_avg: avgConfidence,
        contact_count: contacts.length,
        interaction_count: 0,
        explanation
    };

    return {
        business_id: entity.id,
        score: totalScore,
        breakdown,
        updated_at: new Date().toISOString()
    };
};
