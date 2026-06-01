import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { 
  Cpu, 
  Activity, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  CheckCircle, 
  Zap, 
  Sparkles,
  RefreshCw,
  Info
} from 'lucide-react';
import { Pod } from '../types';

interface HistoricalPoint {
  time: Date;
  timeLabel: string;
  cpu: number;
  latency: number;
  memory: number;
  isBottleneck: boolean;
  bottleneckType?: 'CPU_SPIKE' | 'LATENCY_LAG' | 'MEMORY_LEAK' | 'NOMINAL';
}

interface KubernetesHistoricalChartProps {
  pods: Pod[];
}

export default function KubernetesHistoricalChart({ pods }: KubernetesHistoricalChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // States
  const [selectedPodId, setSelectedPodId] = useState<string>('');
  const [timeRange, setTimeRange] = useState<'30m' | '24h'>('24h');
  const [activeMetric, setActiveMetric] = useState<'cpu' | 'latency' | 'both'>('both');
  const [dimensions, setDimensions] = useState({ width: 500, height: 260 });
  const [chartLayout, setChartLayout] = useState<'area' | 'bar'>('area');
  
  // Keep track of hover/tooltip state
  const [hoveredPoint, setHoveredPoint] = useState<HistoricalPoint | null>(null);
  const [hoverCoords, setHoverCoords] = useState<{ x: number; y: number } | null>(null);

  // Auto-set default selection when pods load
  useEffect(() => {
    if (pods.length > 0 && !selectedPodId) {
      // Prefer running simulation pods first
      const preferPod = pods.find(p => p.status === 'Running' && p.id.startsWith('p_')) || pods[0];
      setSelectedPodId(preferPod.id);
    }
  }, [pods, selectedPodId]);

  const selectedPod = useMemo(() => {
    return pods.find(p => p.id === selectedPodId) || pods[0] || null;
  }, [pods, selectedPodId]);

  // Generate deterministic timeseries data based on target pod metadata & jitter seeds
  const historicalData = useMemo(() => {
    if (!selectedPod) return [];

    const points: HistoricalPoint[] = [];
    const count = timeRange === '30m' ? 30 : 24;
    const now = new Date();

    // Generate base profile parameters determined by pod credentials to make data realistic
    let baseCpu = selectedPod.cpu > 0 ? selectedPod.cpu : 25;
    let baseMemory = selectedPod.memory > 0 ? selectedPod.memory : 512;
    let baseLatency = 15 + (baseCpu * 1.4) + (baseMemory / 64);

    // Apply specific signatures per pod type
    const isHeavy = selectedPod.name.includes('unreal') || selectedPod.name.includes('unity');
    const isPlayC = selectedPod.name.includes('playcanvas');
    const isRedis = selectedPod.name.includes('redis');
    const isVector = selectedPod.name.includes('vector');

    if (isHeavy) {
      baseCpu = 70;
      baseLatency = 85;
    } else if (isPlayC) {
      baseCpu = 38;
      baseLatency = 24;
    } else if (isRedis) {
      baseCpu = 15;
      baseLatency = 4;
    } else if (isVector) {
      baseCpu = 32;
      baseLatency = 45;
    }

    // Set stable pseudo-random seed generator
    let seed = selectedPod.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const random = () => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };

    for (let i = count - 1; i >= 0; i--) {
      const itemTime = new Date(now.getTime() - (timeRange === '30m' ? i * 60 * 1000 : i * 60 * 60 * 1000));
      
      // Calculate time labeling
      const hours = itemTime.getHours().toString().padStart(2, '0');
      const mins = itemTime.getMinutes().toString().padStart(2, '0');
      const timeLabel = timeRange === '30m' ? `${hours}:${mins}` : `${hours}:00`;

      // Simulating realistic waves using sine cycles & spikes
      const diurnalFactor = Math.sin((itemTime.getHours() / 24) * Math.PI * 2) * 12; // peak hours wave
      const stepChaos = random() - 0.5;
      
      // Compute specific spikes (bottlenecks) at particular hours
      let cpuSpike = 0;
      let latencySpike = 0;
      
      // Create interesting bottleneck patterns (e.g., peak at 14:00, or random index spike)
      const dayHour = itemTime.getHours();
      if (timeRange === '24h') {
        if (dayHour === 14 || dayHour === 15) {
          // Cache thrashing bottleneck simulation
          cpuSpike = isHeavy ? 22 : 45;
          latencySpike = isHeavy ? 60 : 90;
        } else if (dayHour === 4 || dayHour === 5) {
          // Background telemetry sync, high latency but light cpu
          latencySpike = 110;
        }
      } else {
        // For 30m range, spike in the middle of time points
        if (i === 12 || i === 13) {
          cpuSpike = 38;
          latencySpike = 125;
        }
      }

      // Final CPU Calculation bounded 0-100%
      const finalCpu = Math.max(2, Math.min(99, Math.round(
        baseCpu + diurnalFactor + (stepChaos * 8) + cpuSpike
      )));

      // Final Memory (slight memory leak simulated over time)
      const shrinkFactor = (count - 1 - i) / count;
      const finalMemory = Math.round(baseMemory + (shrinkFactor * (isHeavy ? 180 : 35)) + (random() * 10));

      // Final Latency proportional to CPU load with synthetic jitter
      const finalLatency = Math.max(1.2, Math.min(240, Math.round(
        baseLatency + (finalCpu * 0.8) + (random() * 15) + latencySpike
      )));

      // Determine bottleneck thresholds
      const isCpuBottleneck = finalCpu > 78;
      const isLatencyBottleneck = finalLatency > 110;
      const isBottleneck = isCpuBottleneck || isLatencyBottleneck;
      
      let bottleneckType: HistoricalPoint['bottleneckType'] = 'NOMINAL';
      if (isCpuBottleneck) bottleneckType = 'CPU_SPIKE';
      else if (isLatencyBottleneck) bottleneckType = 'LATENCY_LAG';

      points.push({
        time: itemTime,
        timeLabel,
        cpu: finalCpu,
        latency: finalLatency,
        memory: finalMemory,
        isBottleneck,
        bottleneckType
      });
    }

    return points;
  }, [selectedPod, timeRange]);

  // Compute stats on the timeseries
  const chartStats = useMemo(() => {
    if (historicalData.length === 0) return null;
    const maxCpu = d3.max(historicalData, d => d.cpu) || 0;
    const avgCpu = Math.round(d3.mean(historicalData, d => d.cpu) || 0);
    const maxLatency = d3.max(historicalData, d => d.latency) || 0;
    const avgLatency = Math.round(d3.mean(historicalData, d => d.latency) || 0);
    const bottlenecks = historicalData.filter(d => d.isBottleneck);

    return {
      maxCpu,
      avgCpu,
      maxLatency,
      avgLatency,
      bottlenecksCount: bottlenecks.length,
      criticalPoints: bottlenecks.map(b => ({
        timeLabel: b.timeLabel,
        type: b.bottleneckType,
        cpu: b.cpu,
        latency: b.latency
      }))
    };
  }, [historicalData]);

  // Monitor container size dynamically for absolute responsiveness
  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        // set height with reasonable aspect ratio
        setDimensions({
          width: Math.max(300, width),
          height: 240
        });
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Render D3 SVG graph
  useEffect(() => {
    if (!svgRef.current || historicalData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Flush previous cycle renders

    const { width, height } = dimensions;
    const margin = { top: 20, right: 45, bottom: 30, left: 45 };

    // Set up Scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(historicalData, d => d.time) as [Date, Date])
      .range([margin.left, width - margin.right]);

    const yCpuScale = d3.scaleLinear()
      .domain([0, 100]) // Percentage Bounds
      .range([height - margin.bottom, margin.top]);

    const maxLatVal = d3.max(historicalData, d => d.latency) || 120;
    // Set dynamic max bound to keep graph proportions high-contrast
    const yLatencyScale = d3.scaleLinear()
      .domain([0, Math.max(100, Math.ceil(maxLatVal / 40) * 40)])
      .range([height - margin.bottom, margin.top]);

    // Create unique gradients for area fills under path
    const defs = svg.append('defs');

    // CPU Area Shader
    const cpuGrad = defs.append('linearGradient')
      .attr('id', 'cpuGrad')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    cpuGrad.append('stop').attr('offset', '0%').attr('stop-color', '#00b8ff').attr('stop-opacity', '0.22');
    cpuGrad.append('stop').attr('offset', '100%').attr('stop-color', '#00b8ff').attr('stop-opacity', '0.00');

    // Latency Area Shader
    const latGrad = defs.append('linearGradient')
      .attr('id', 'latGrad')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    latGrad.append('stop').attr('offset', '0%').attr('stop-color', '#a78bfa').attr('stop-opacity', '0.22');
    latGrad.append('stop').attr('offset', '100%').attr('stop-color', '#a78bfa').attr('stop-opacity', '0.00');

    // Render Grid Lines
    const makeYGridLines = () => d3.axisLeft(yCpuScale).ticks(5);
    
    svg.append('g')
      .attr('class', 'grid text-zinc-800 opacity-25')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(
        makeYGridLines()
          .tickSize(-width + margin.left + margin.right)
          .tickFormat(() => '')
      );

    // X-Axis
    const xAxis = d3.axisBottom(xScale)
      .ticks(Math.min(dimensions.width / 60, 8))
      .tickFormat((d) => {
        const tDate = d as Date;
        const hr = tDate.getHours().toString().padStart(2, '0');
        const mn = tDate.getMinutes().toString().padStart(2, '0');
        return timeRange === '30m' ? `${hr}:${mn}` : `${hr}:00`;
      });

    svg.append('g')
      .attr('transform', `translate(0, ${height - margin.bottom})`)
      .attr('class', 'text-zinc-650 font-mono text-[9px]')
      .call(xAxis)
      .call(g => g.select('.domain').attr('stroke', 'rgba(255,255,255,0.08)'))
      .call(g => g.selectAll('.tick line').attr('stroke', 'rgba(255,255,255,0.08)'));

    // Render chart graphics based on format
    const stepWidth = (width - margin.left - margin.right) / historicalData.length;
    const barWidth = Math.max(3, stepWidth * 0.38);

    if (chartLayout === 'bar') {
      // Draw CPU BARS
      if (activeMetric === 'cpu' || activeMetric === 'both') {
        const xOffset = activeMetric === 'both' ? -barWidth : -barWidth / 2;
        svg.append('g')
          .attr('class', 'cpu-bars')
          .selectAll('rect')
          .data(historicalData)
          .enter()
          .append('rect')
          .attr('x', d => xScale(d.time) + xOffset)
          .attr('y', d => yCpuScale(d.cpu))
          .attr('width', barWidth)
          .attr('height', d => Math.max(0, height - margin.bottom - yCpuScale(d.cpu)))
          .attr('fill', '#00b8ff')
          .attr('opacity', 0.8)
          .attr('rx', 1.5);
      }

      // Draw Latency BARS
      if (activeMetric === 'latency' || activeMetric === 'both') {
        const xOffset = activeMetric === 'both' ? 0 : -barWidth / 2;
        svg.append('g')
          .attr('class', 'latency-bars')
          .selectAll('rect')
          .data(historicalData)
          .enter()
          .append('rect')
          .attr('x', d => xScale(d.time) + xOffset)
          .attr('y', d => yLatencyScale(d.latency))
          .attr('width', barWidth)
          .attr('height', d => Math.max(0, height - margin.bottom - yLatencyScale(d.latency)))
          .attr('fill', '#a78bfa')
          .attr('opacity', 0.8)
          .attr('rx', 1.5);
      }
    } else {
      // Draw CPU Line and Area Fill
      if (activeMetric === 'cpu' || activeMetric === 'both') {
        const cpuArea = d3.area<HistoricalPoint>()
          .x(d => xScale(d.time))
          .y0(height - margin.bottom)
          .y1(d => yCpuScale(d.cpu))
          .curve(d3.curveMonotoneX);

        svg.append('path')
          .datum(historicalData)
          .attr('class', 'area')
          .attr('fill', 'url(#cpuGrad)')
          .attr('d', cpuArea);

        const cpuLine = d3.line<HistoricalPoint>()
          .x(d => xScale(d.time))
          .y(d => yCpuScale(d.cpu))
          .curve(d3.curveMonotoneX);

        // Shadow glow path (blur overlay)
        svg.append('path')
          .datum(historicalData)
          .attr('fill', 'none')
          .attr('stroke', '#00b8ff')
          .attr('stroke-width', 4)
          .attr('opacity', 0.15)
          .attr('d', cpuLine);

        // Primary core path
        svg.append('path')
          .datum(historicalData)
          .attr('fill', 'none')
          .attr('stroke', '#00b8ff')
          .attr('stroke-width', 1.8)
          .attr('d', cpuLine);
      }

      // Draw Latency Line and Area Fill
      if (activeMetric === 'latency' || activeMetric === 'both') {
        const latArea = d3.area<HistoricalPoint>()
          .x(d => xScale(d.time))
          .y0(height - margin.bottom)
          .y1(d => yLatencyScale(d.latency))
          .curve(d3.curveMonotoneX);

        svg.append('path')
          .datum(historicalData)
          .attr('class', 'area')
          .attr('fill', 'url(#latGrad)')
          .attr('d', latArea);

        const latLine = d3.line<HistoricalPoint>()
          .x(d => xScale(d.time))
          .y(d => yLatencyScale(d.latency))
          .curve(d3.curveMonotoneX);

        // Shadow glow line
        svg.append('path')
          .datum(historicalData)
          .attr('fill', 'none')
          .attr('stroke', '#a78bfa')
          .attr('stroke-width', 4)
          .attr('opacity', 0.15)
          .attr('d', latLine);

        // Primary path
        svg.append('path')
          .datum(historicalData)
          .attr('fill', 'none')
          .attr('stroke', '#a78bfa')
          .attr('stroke-width', 1.8)
          .attr('d', latLine);
      }
    }

    // Highlight Bottlenecks directly on the lines
    const bottlenecks = historicalData.filter(d => d.isBottleneck);
    
    // Bottleneck Marker Dots group
    const dotsGroup = svg.append('g').attr('class', 'bottleneck-markers');
    
    bottlenecks.forEach(b => {
      let xCpu = xScale(b.time);
      let xLat = xScale(b.time);

      if (chartLayout === 'bar') {
        xCpu += (activeMetric === 'both' ? -barWidth / 2 : 0);
        xLat += (activeMetric === 'both' ? barWidth / 2 : 0);
      }
      
      if (b.bottleneckType === 'CPU_SPIKE' && (activeMetric === 'cpu' || activeMetric === 'both')) {
        const y = yCpuScale(b.cpu);
        // Outer pulsing hazard ring
        dotsGroup.append('circle')
          .attr('cx', xCpu)
          .attr('cy', y)
          .attr('r', 6)
          .attr('fill', 'rgba(239, 68, 68, 0.2)')
          .attr('stroke', '#ef4444')
          .attr('stroke-width', 1)
          .attr('class', 'animate-pulse');

        dotsGroup.append('circle')
          .attr('cx', xCpu)
          .attr('cy', y)
          .attr('r', 3.5)
          .attr('fill', '#ef4444');
      }

      if (b.bottleneckType === 'LATENCY_LAG' && (activeMetric === 'latency' || activeMetric === 'both')) {
        const y = yLatencyScale(b.latency);
        
        dotsGroup.append('circle')
          .attr('cx', xLat)
          .attr('cy', y)
          .attr('r', 6)
          .attr('fill', 'rgba(245, 158, 11, 0.2)')
          .attr('stroke', '#f59e0b')
          .attr('stroke-width', 1);

        dotsGroup.append('circle')
          .attr('cx', xLat)
          .attr('cy', y)
          .attr('r', 3.5)
          .attr('fill', '#f59e0b');
      }
    });

    // Left Y-Axis (CPU Scale)
    if (activeMetric === 'cpu' || activeMetric === 'both') {
      const leftYAxis = d3.axisLeft(yCpuScale).ticks(5).tickFormat(d => `${d}%`);
      svg.append('g')
        .attr('transform', `translate(${margin.left}, 0)`)
        .attr('class', 'text-[#00b8ff] font-mono text-[8.5px] opacity-80')
        .call(leftYAxis)
        .call(g => g.select('.domain').remove())
        .call(g => g.selectAll('.tick line').attr('stroke', 'rgba(255,255,255,0.03)'));
    }

    // Right Y-Axis (Latency Scale)
    if (activeMetric === 'latency' || activeMetric === 'both') {
      const rightYAxis = d3.axisRight(yLatencyScale).ticks(5).tickFormat(d => `${d}ms`);
      svg.append('g')
        .attr('transform', `translate(${width - margin.right}, 0)`)
        .attr('class', 'text-[#a78bfa] font-mono text-[8.5px] opacity-80')
        .call(rightYAxis)
        .call(g => g.select('.domain').remove())
        .call(g => g.selectAll('.tick line').attr('stroke', 'transparent'));
    }

    // Drag-hover Interactive tracker mouse overlay
    const hoverGroup = svg.append('g').attr('class', 'hover-helpers').style('display', 'none');
    
    // Vertical tracker line
    const trackerLine = hoverGroup.append('line')
      .attr('stroke', 'rgba(255, 255, 255, 0.15)')
      .attr('stroke-dasharray', '2,2')
      .attr('y1', margin.top)
      .attr('y2', height - margin.bottom);

    // CPU intersecting node
    const cpuIntersect = hoverGroup.append('circle')
      .attr('r', 4.5)
      .attr('fill', '#00b8ff')
      .attr('stroke', '#080a0f')
      .attr('stroke-width', 1.5);

    // Latency intersecting node
    const latIntersect = hoverGroup.append('circle')
      .attr('r', 4.5)
      .attr('fill', '#a78bfa')
      .attr('stroke', '#080a0f')
      .attr('stroke-width', 1.5);

    // Big invisible event capture surface
    const rect = svg.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'transparent')
      .style('cursor', 'crosshair');

    // Mouse events
    rect.on('mousemove', (event) => {
      const mouseCoords = d3.pointer(event);
      const mouseX = mouseCoords[0];

      // Limit search to chart margins
      if (mouseX < margin.left || mouseX > width - margin.right) {
        hoverGroup.style('display', 'none');
        setHoveredPoint(null);
        setHoverCoords(null);
        return;
      }

      // Convert coordinates back to date space
      const correspondingDate = xScale.invert(mouseX);
      
      // Bisect to spot nearest point index
      const bisect = d3.bisector<HistoricalPoint, Date>(d => d.time).left;
      const index = bisect(historicalData, correspondingDate, 1);
      
      const point0 = historicalData[index - 1];
      const point1 = historicalData[index];
      let point = point0;

      if (point1 && point0) {
        // Find which is mathematically closer
        point = (correspondingDate.getTime() - point0.time.getTime() > point1.time.getTime() - correspondingDate.getTime()) ? point1 : point0;
      }

      if (point) {
        const targetX = xScale(point.time);
        hoverGroup.style('display', null);
        trackerLine.attr('x1', targetX).attr('x2', targetX);

        let targetCpuX = targetX;
        let targetLatX = targetX;
        if (chartLayout === 'bar') {
          targetCpuX += (activeMetric === 'both' ? -barWidth / 2 : 0);
          targetLatX += (activeMetric === 'both' ? barWidth / 2 : 0);
        }

        if (activeMetric === 'cpu' || activeMetric === 'both') {
          cpuIntersect.attr('cx', targetCpuX).attr('cy', yCpuScale(point.cpu)).style('display', null);
        } else {
          cpuIntersect.style('display', 'none');
        }

        if (activeMetric === 'latency' || activeMetric === 'both') {
          latIntersect.attr('cx', targetLatX).attr('cy', yLatencyScale(point.latency)).style('display', null);
        } else {
          latIntersect.style('display', 'none');
        }

        // Adjust React overlay location parameters
        setHoveredPoint(point);
        setHoverCoords({ x: targetX, y: event.clientY });
      }
    });

    rect.on('mouseleave', () => {
      hoverGroup.style('display', 'none');
      setHoveredPoint(null);
      setHoverCoords(null);
    });

  }, [historicalData, activeMetric, dimensions, timeRange, chartLayout]);

  return (
    <div className="bg-[#111318] border border-white/5 rounded-2xl p-5 space-y-4 relative overflow-hidden group">
      {/* Visual background ambient accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#00b8ff]/2 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute -bottom-10 left-12 w-64 h-64 bg-purple-500/[0.01] rounded-full blur-[80px] pointer-events-none" />

      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-white/5 relative z-10">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="p-1 px-1.5 bg-[#00b8ff]/10 text-[#00b8ff] rounded border border-[#00b8ff]/15 text-[8.5px] font-extrabold uppercase font-mono tracking-widest flex items-center gap-1.5">
              <Activity className="w-2.5 h-2.5 animate-pulse" />
              Dynamic telemetry
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">D3 LINE PERSPECTIVE</span>
          </div>
          <h3 className="text-sm font-bold text-white uppercase tracking-tight flex items-center gap-2">
            Historical Pod Loading & Schedulers
          </h3>
        </div>

        {/* Action controls */}
        <div className="flex flex-wrap items-center gap-2 text-[10px]">
          {/* Pod Dropdown */}
          <select
            value={selectedPodId}
            onChange={(e) => setSelectedPodId(e.target.value)}
            className="bg-black/60 border border-white/5 rounded px-2.5 py-1.5 text-zinc-300 font-bold uppercase transition-all tracking-wide outline-none hover:border-[#00b8ff]/30 cursor-pointer"
          >
            {pods.map(p => (
              <option key={p.id} value={p.id} className="bg-[#111318] text-zinc-350">
                POD: {p.name.slice(0, 18)}{p.name.length > 18 ? '...' : ''} ({p.namespace})
              </option>
            ))}
          </select>

          {/* Metric Selection */}
          <div className="flex bg-black/40 border border-white/5 rounded p-0.5 font-bold">
            <button
              onClick={() => setActiveMetric('both')}
              className={`px-3 py-1 rounded transition-all lowercase ${activeMetric === 'both' ? 'bg-[#00b8ff]/15 text-[#00b8ff]' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              all
            </button>
            <button
              onClick={() => setActiveMetric('cpu')}
              className={`px-3 py-1 rounded transition-all lowercase ${activeMetric === 'cpu' ? 'bg-[#00b8ff]/15 text-[#00b8ff]' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              cpu
            </button>
            <button
              onClick={() => setActiveMetric('latency')}
              className={`px-3 py-1 rounded transition-all lowercase ${activeMetric === 'latency' ? 'bg-purple-500/15 text-[#a78bfa]' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              latency
            </button>
          </div>

          {/* Chart Layout Toggle */}
          <div className="flex bg-black/40 border border-white/5 rounded p-0.5 font-bold">
            <button
              onClick={() => setChartLayout('area')}
              className={`px-2.5 py-1 rounded transition-all lowercase ${chartLayout === 'area' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              area
            </button>
            <button
              onClick={() => setChartLayout('bar')}
              className={`px-2.5 py-1 rounded transition-all lowercase ${chartLayout === 'bar' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              bar
            </button>
          </div>

          {/* Time range */}
          <div className="flex bg-black/40 border border-white/5 rounded p-0.5 font-bold">
            <button
              onClick={() => setTimeRange('30m')}
              className={`px-2 py-1 rounded transition-all ${timeRange === '30m' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              30M
            </button>
            <button
              onClick={() => setTimeRange('24h')}
              className={`px-2 py-1 rounded transition-all ${timeRange === '24h' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              24H
            </button>
          </div>
        </div>
      </div>

      {/* Main chart panels */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 items-stretch relative z-10">
        
        {/* Left readout: Critical Bottlenecks and stats */}
        <div className="lg:col-span-1 bg-black/35 border border-white/[0.03] rounded-xl p-4 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <span className="text-[9px] font-black tracking-widest text-[#64748b] block uppercase">Bottlenecks Scanned</span>
            
            {/* Health status header */}
            <div className="flex items-center gap-3">
              {chartStats && chartStats.bottlenecksCount > 0 ? (
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                  <AlertTriangle className="w-4 h-4 animate-bounce" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-lg bg-[#00e5a0]/10 border border-[#00e5a0]/20 flex items-center justify-center text-[#00e5a0]">
                  <CheckCircle className="w-4 h-4" />
                </div>
              )}
              <div className="space-y-0.5">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Integrity Grading</span>
                <span className={`text-[12px] font-extrabold uppercase ${chartStats && chartStats.bottlenecksCount > 0 ? 'text-orange-400' : 'text-[#00e5a0]'}`}>
                  {chartStats && chartStats.bottlenecksCount > 0 ? `${chartStats.bottlenecksCount} SPIKES DETECTED` : 'NOMINAL_OPTIMIZED'}
                </span>
              </div>
            </div>

            {/* Readout stats group */}
            <div className="grid grid-cols-2 gap-3 border-t border-white/5 pt-3">
              <div className="space-y-0.5">
                <span className="text-[8.5px] text-zinc-500 uppercase block font-mono">AVG_CPU</span>
                <span className="text-sm font-bold text-[#00b8ff] font-mono">{chartStats?.avgCpu}%</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[8.5px] text-zinc-500 uppercase block font-mono">PEAK_CPU</span>
                <span className="text-sm font-bold text-[#00b8ff] font-mono">{chartStats?.maxCpu}%</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[8.5px] text-zinc-500 uppercase block font-mono">AVG_LATENCY</span>
                <span className="text-sm font-bold text-[#a78bfa] font-mono">{chartStats?.avgLatency}ms</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[8.5px] text-zinc-500 uppercase block font-mono">PEAK_LATENCY</span>
                <span className="text-sm font-bold text-[#a78bfa] font-mono">{chartStats?.maxLatency}ms</span>
              </div>
            </div>
          </div>

          {/* Small diagnostic insight text box */}
          <div className="p-2.5 bg-white/[0.01] border border-white/5 rounded-lg text-[9px] text-zinc-500 font-mono leading-relaxed uppercase">
            <Info className="w-3 h-3 text-[#00b8ff] inline mr-1 -mt-0.5" />
            {selectedPod?.status === 'Pending' ? (
              <span className="text-amber-400">Pod pending. Scheduler allocation waiting validation metrics.</span>
            ) : chartStats && chartStats.bottlenecksCount > 0 ? (
              <span>Periodic task thrashing detected on cycles. Adjust buffer parameters on pod scheduler.</span>
            ) : (
              <span>Memory footprints inside safety boundaries. Host network degradation is minimal.</span>
            )}
          </div>
        </div>

        {/* Right readout: The main interactive D3 graph canvas wrapper */}
        <div className="lg:col-span-3 flex flex-col justify-between space-y-4">
          
          {/* Main D3 canvas element */}
          <div ref={containerRef} className="w-full bg-[#08090d]/65 border border-white/[0.02] rounded-xl relative overflow-hidden flex items-center justify-center p-2 min-h-[240px]">
            <svg 
              id="kubernetes-historical-chart-d3-svg" 
              ref={svgRef} 
              className="w-full" 
              style={{ height: dimensions.height }} 
            />

            {/* Static overlay legends */}
            <div className="absolute top-3 left-4 flex gap-4 text-[8px] font-bold tracking-widest text-[#64748b] bg-black/40 backdrop-blur px-2.5 py-1.5 rounded-md border border-white/5 uppercase">
              { (activeMetric === 'cpu' || activeMetric === 'both') && (
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00b8ff]" />
                  <span>{chartLayout === 'bar' ? 'CPU BARS' : 'CPU LINE'} (LEFT AXIS)</span>
                </div>
              )}
              { (activeMetric === 'latency' || activeMetric === 'both') && (
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#a78bfa]" />
                  <span>{chartLayout === 'bar' ? 'LATENCY BARS' : 'LATENCY LINE'} (RIGHT AXIS)</span>
                </div>
              )}
            </div>

            {/* Simulated tooltips built securely as absolute overlay positions */}
            {hoveredPoint && (
              <div 
                className="absolute bg-[#0c0e14] border border-white/10 rounded-xl p-3 shadow-2xl z-[50] pointer-events-none flex flex-col gap-2 font-mono"
                style={{
                  left: `${Math.min(dimensions.width - 150, Math.max(10, hoverCoords ? hoverCoords.x - 70 : 0))}px`,
                  top: '12px'
                }}
              >
                <div className="flex items-center justify-between border-b border-white/5 pb-1 gap-4">
                  <span className="text-[9.5px] font-black text-white">{hoveredPoint.timeLabel}</span>
                  {hoveredPoint.isBottleneck ? (
                    <span className="text-[8px] font-black text-red-400 bg-red-400/10 border border-red-400/20 px-1 py-0.5 rounded uppercase">anomaly</span>
                  ) : (
                    <span className="text-[8px] font-black text-[#00e5a0] uppercase">nominal</span>
                  )}
                </div>
                <div className="space-y-1 text-[10px]">
                  <div className="flex justify-between gap-6">
                    <span className="text-zinc-500 uppercase">CPU LOADING</span>
                    <span className="font-bold text-[#00b8ff]">{hoveredPoint.cpu}%</span>
                  </div>
                  <div className="flex justify-between gap-6">
                    <span className="text-zinc-500 uppercase">LATENCY ROUTE</span>
                    <span className="font-bold text-[#a78bfa]">{hoveredPoint.latency}ms</span>
                  </div>
                  <div className="flex justify-between gap-6">
                    <span className="text-zinc-500 uppercase">MEM BUFFER</span>
                    <span className="font-bold text-zinc-300">{hoveredPoint.memory}MB</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Subordinate info telemetry grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-black/20 border border-white/5 rounded-xl flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest block">Active Host Node</span>
                <span className="text-[10px] font-bold text-white uppercase">{selectedPod?.node || 'node-02'}</span>
              </div>
              <TrendingUp className="w-4 h-4 text-zinc-600" />
            </div>

            <div className="p-3 bg-black/20 border border-white/5 rounded-xl flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest block">Namespace scope</span>
                <span className="text-[10px] font-bold text-white uppercase">{selectedPod?.namespace || 'Default'}</span>
              </div>
              <Activity className="w-4 h-4 text-zinc-600" />
            </div>

            <div className="p-3 bg-black/20 border border-white/5 rounded-xl flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest block">Virtual Shard Cluster</span>
                <span className="text-[10px] font-bold text-[#00b8ff] uppercase font-mono tracking-wide">US-WEST-2-GKE</span>
              </div>
              <Sparkles className="w-4 h-4 text-[#00b8ff] opacity-60" />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
