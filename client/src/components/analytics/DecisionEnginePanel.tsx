/**
 * Decision Engine Panel Component
 * Displays AI recommendations from the Decision Logic Engine
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Brain, TrendingUp, AlertTriangle, CheckCircle, Clock, Target } from 'lucide-react';

interface DecisionEnginePanelProps {
  decisions: any[];
  history: any[];
  sport: string;
}

export function DecisionEnginePanel({ decisions, history, sport }: DecisionEnginePanelProps) {
  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'very_high': return 'bg-green-100 text-green-800';
      case 'high': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-orange-100 text-orange-800';
      case 'very_low': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'immediate': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'urgent': return <Clock className="w-4 h-4 text-orange-500" />;
      case 'moderate': return <Target className="w-4 h-4 text-yellow-500" />;
      case 'low': return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'planned': return <TrendingUp className="w-4 h-4 text-green-500" />;
      default: return <Brain className="w-4 h-4 text-gray-500" />;
    }
  };

  const getDecisionTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      offensive_action: 'bg-red-100 text-red-800',
      defensive_action: 'bg-blue-100 text-blue-800',
      tactical_adjustment: 'bg-purple-100 text-purple-800',
      positioning: 'bg-green-100 text-green-800',
      technique_improvement: 'bg-yellow-100 text-yellow-800',
      strategy_change: 'bg-indigo-100 text-indigo-800',
      equipment_adjustment: 'bg-pink-100 text-pink-800',
      training_focus: 'bg-orange-100 text-orange-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Current Decisions Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Decisions</p>
                <p className="text-2xl font-bold">{decisions.length}</p>
              </div>
              <Brain className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Confidence</p>
                <p className="text-2xl font-bold">
                  {decisions.length > 0 ? 
                    (decisions.reduce((acc, d) => acc + d.overall_confidence, 0) / decisions.length * 100).toFixed(0) : 
                    0}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Decision History</p>
                <p className="text-2xl font-bold">{history.length}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Decision Analyses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Current AI Recommendations ({decisions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {decisions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No active decisions</p>
            ) : (
              decisions.map((analysis, index) => (
                <div key={index} className="border rounded-lg p-4">
                  {/* Primary Decision */}
                  <div className="mb-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">
                          {analysis.primary_decision.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-2">
                          {analysis.primary_decision.description}
                        </p>
                        <div className="flex items-center gap-2 mb-3">
                          <Badge className={getDecisionTypeColor(analysis.primary_decision.decision_type)}>
                            {analysis.primary_decision.decision_type.replace('_', ' ')}
                          </Badge>
                          <Badge className={getConfidenceColor(analysis.primary_decision.confidence)}>
                            {analysis.primary_decision.confidence}
                          </Badge>
                          <div className="flex items-center gap-1">
                            {getUrgencyIcon(analysis.primary_decision.urgency)}
                            <span className="text-sm capitalize">{analysis.primary_decision.urgency}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-2xl font-bold text-green-600">
                          {(analysis.primary_decision.expected_impact * 100).toFixed(0)}%
                        </p>
                        <p className="text-xs text-gray-500">Expected Impact</p>
                      </div>
                    </div>

                    {/* Recommendation */}
                    <Alert className="mb-4">
                      <Brain className="h-4 w-4" />
                      <AlertDescription className="font-medium">
                        {analysis.primary_decision.recommendation}
                      </AlertDescription>
                    </Alert>

                    {/* Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Success Probability</p>
                        <Progress value={analysis.primary_decision.success_probability * 100} className="mt-1" />
                        <p className="text-xs text-gray-500 mt-1">
                          {(analysis.primary_decision.success_probability * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Risk Assessment</p>
                        <Progress 
                          value={analysis.primary_decision.risk_assessment * 100} 
                          className="mt-1"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {(analysis.primary_decision.risk_assessment * 100).toFixed(1)}% risk
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Overall Confidence</p>
                        <Progress value={analysis.overall_confidence * 100} className="mt-1" />
                        <p className="text-xs text-gray-500 mt-1">
                          {(analysis.overall_confidence * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    {/* Implementation Steps */}
                    {analysis.primary_decision.implementation_steps && 
                     analysis.primary_decision.implementation_steps.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-medium text-sm text-gray-700 mb-2">Implementation Steps:</h4>
                        <ol className="list-decimal list-inside space-y-1 text-sm">
                          {analysis.primary_decision.implementation_steps.map((step: string, stepIndex: number) => (
                            <li key={stepIndex} className="text-gray-600">{step}</li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>

                  {/* Situation Analysis */}
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Situation Analysis</h4>
                    <p className="text-sm text-gray-600 mb-3">{analysis.situation_summary}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h5 className="font-medium text-xs text-gray-700 mb-1">Key Factors</h5>
                        <ul className="text-xs space-y-1">
                          {analysis.key_factors.map((factor: string, idx: number) => (
                            <li key={idx} className="text-gray-600">• {factor}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-medium text-xs text-gray-700 mb-1">Constraints</h5>
                        <ul className="text-xs space-y-1">
                          {analysis.constraints.map((constraint: string, idx: number) => (
                            <li key={idx} className="text-gray-600">• {constraint}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-medium text-xs text-gray-700 mb-1">Opportunities</h5>
                        <ul className="text-xs space-y-1">
                          {analysis.opportunities.map((opportunity: string, idx: number) => (
                            <li key={idx} className="text-gray-600">• {opportunity}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Alternative Decisions */}
                  {analysis.alternative_decisions && analysis.alternative_decisions.length > 0 && (
                    <div className="border-t pt-4 mt-4">
                      <h4 className="font-medium mb-3">Alternative Options</h4>
                      <div className="space-y-2">
                        {analysis.alternative_decisions.map((alt: any, altIndex: number) => (
                          <div key={altIndex} className="bg-gray-50 p-3 rounded">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-sm">{alt.title}</p>
                                <p className="text-xs text-gray-600">{alt.description}</p>
                              </div>
                              <div className="text-right">
                                <Badge className={getConfidenceColor(alt.confidence)} variant="secondary">
                                  {alt.confidence}
                                </Badge>
                                <p className="text-xs text-gray-500 mt-1">
                                  {(alt.expected_impact * 100).toFixed(0)}% impact
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Decision History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Decision History ({history.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {history.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No decision history</p>
            ) : (
              history.slice(-10).reverse().map((decision, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge className={getDecisionTypeColor(decision.decision_type)} variant="secondary">
                      {decision.decision_type.replace('_', ' ')}
                    </Badge>
                    <div>
                      <p className="font-medium text-sm">{decision.title}</p>
                      <p className="text-xs text-gray-600">{decision.recommendation}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 mb-1">
                      {getUrgencyIcon(decision.urgency)}
                      <Badge className={getConfidenceColor(decision.confidence)} variant="secondary">
                        {decision.confidence}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500">
                      Impact: {(decision.expected_impact * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Decision Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Decision Engine Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {history.filter(d => d.confidence === 'very_high' || d.confidence === 'high').length}
              </p>
              <p className="text-sm text-gray-600">High Confidence</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {history.filter(d => d.urgency === 'immediate' || d.urgency === 'urgent').length}
              </p>
              <p className="text-sm text-gray-600">Urgent Decisions</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {history.length > 0 ? 
                  (history.reduce((acc, d) => acc + d.expected_impact, 0) / history.length * 100).toFixed(0) : 
                  0}%
              </p>
              <p className="text-sm text-gray-600">Avg Impact</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {Array.from(new Set(history.map(d => d.decision_type))).length}
              </p>
              <p className="text-sm text-gray-600">Decision Types</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}